document.addEventListener('DOMContentLoaded', function() {
    var searchBtn = document.querySelector("#searchButton");
    var stationInput = document.querySelector("#station");

    searchBtn.addEventListener("click", function() {
        console.log("클릭");
        fetchStations();
    });

    stationInput.addEventListener("keypress", function(event) {
        if (event.key === 'Enter') {
            fetchStations();
        }
    });

    function fetchStations() {
        var keyword = stationInput.value;
        if (!keyword) {
            displayStations([]); // 검색어가 없을 경우 빈 배열을 전달하여 결과를 지움
            return;
        }

        var url = '/api/stations?keyword=' + encodeURIComponent(keyword);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                displayStations(data);
            }
        };
        xhr.send();
    }

    function displayStations(stations) {
        var searchResultContainer = document.querySelector(".searchResults");
        searchResultContainer.innerHTML = "";

        if (stations.length > 0) {
            stations.forEach(function(station) {
                var resultElement = document.createElement("div");
                resultElement.classList.add("searchResultBox");

                var stationNameElement = document.createElement("div");
                stationNameElement.classList.add("stationName");
                stationNameElement.textContent = station.name;
                resultElement.appendChild(stationNameElement);

                var busCodeElement = document.createElement("div");
                busCodeElement.classList.add("busCode");
                busCodeElement.textContent = station.code;
                resultElement.appendChild(busCodeElement);

                resultElement.addEventListener("click", function() {
                    displayBusStationInfo(station.code);
                });

                searchResultContainer.appendChild(resultElement);
            });
        } else {
            searchResultContainer.textContent = "검색 결과가 없습니다.";
        }
    }

    function displayBusStationInfo(station_id) {
        var url = '/api/bus_info?station_id=' + encodeURIComponent(station_id);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                makeBusList(data);
            }
        };
        xhr.send();
    }

    function makeBusList(busList) {
        var busInfoContainer = document.querySelector("#busInfo .busResults");

        // 이전에 표시된 버스 정보를 모두 지우기
        busInfoContainer.innerHTML = "";

        // 버스 리스트를 도착 시간이 빠른 순으로 정렬
        busList.sort(function(a, b) {
            // A의 도착 시간이 '곧 도착'인 경우
            if (a.arrive_time === '곧 도착') {
                return -1;
            } else if (b.arrive_time === '곧 도착') {
                return 1;
            } else if (a.arrive_time === '첫 번째 버스 운행종료') {
                return 1;
            } else if (b.arrive_time === '첫 번째 버스 운행종료') {
                return -1;
            } else if (b.arrive_time === '첫 번째 버스 출발대기') {
                return -1;
            } else if (!isNaN(parseFloat(a.arrive_time)) && !isNaN(parseFloat(b.arrive_time))) {
                return parseFloat(a.arrive_time) - parseFloat(b.arrive_time);
            } else {
                return 0;
            }
        });

        // 버스 정보를 표시
        busList.forEach(function(bus) {
            var busElement = document.createElement("div");
            busElement.classList.add("busItem");

            var leftContent = document.createElement("div");
            leftContent.classList.add("leftContent");

            if (bus.bus_type_img) {
                var busTypeImage = document.createElement("img");
                busTypeImage.src = bus.bus_type_img;
                busTypeImage.alt = "버스 종류 이미지";
                leftContent.appendChild(busTypeImage);
            }

            var rightContent = document.createElement("div");
            rightContent.classList.add("rightContent");

            var busNumber = document.createElement("p");
            busNumber.textContent = "버스 번호: " + bus.bus_number;
            rightContent.appendChild(busNumber);

            if (bus.arrive_time && bus.current_station) {
                var arriveTime = document.createElement("p");
                arriveTime.textContent = "도착 시간: " + bus.arrive_time;
                rightContent.appendChild(arriveTime);

                var currentStation = document.createElement("p");
                currentStation.textContent = "현재 정류장: " + bus.current_station;
                rightContent.appendChild(currentStation);
            } else {
                var arriveTime = document.createElement("p");
                arriveTime.textContent = "도착 시간: " + bus.arrive_time;
                rightContent.appendChild(arriveTime);
            }

            busElement.appendChild(rightContent);
            busElement.appendChild(leftContent);
            busInfoContainer.appendChild(busElement);
        });
    }
});
