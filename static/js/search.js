//// 버스정류소 ////

alert("dfdfdfd")
// 데이터베이스에서 정보 가져오기
fetch('db/서울시버스정류소위치정보utf.csv', { headers: { 'Content-Type': 'text/plain; charset=UTF-8' }})
    .then(function(response) {
        response.text().then(function(text) {
            var lines = text.split('\n'); // 개행 문자를 기준으로 각 라인을 분리
            var data = [];
            lines.forEach(function(line) {
                var values = line.split(','); // 쉼표를 기준으로 각 항목을 분리
                var item = {
                    // id: values[0],
                    code: values[1],
                    name: values[2],
                    // x: values[3],
                    // y: values[4],
                    // type: values[5]
                };
                data.push(item);
            });
            // console.log(data[1].name.replace(/\"/g, '')); // 모든 쌍따옴표를 제거
            // console.log(data[0]. code + data[0].name)
            // console.log(typeof(data[3]));/
        });
    });

// 검색 버튼 클릭 이벤트 및 엔터 키 이벤트 처리
var searchBtn = document.querySelector("#searchButton");
var stationInput = document.querySelector("#station");

searchBtn.addEventListener("click", clickSearch);
stationInput.addEventListener("keypress", function(event) {
    if (event.key === 'Enter') {
        clickSearch();
    }
});

// 검색 실행 함수
function clickSearch() {
    var searchKeyword = stationInput.value; // 검색어 가져오기
    searchStation(searchKeyword); // 검색어로 검색 실행
}

// 버스정류장 정보 가져오기 및 검색 결과 출력 함수
function searchStation(keyword) {
    fetch('db/서울시버스정류소위치정보utf.csv', { headers: { 'Content-Type': 'text/plain; charset=UTF-8' }})
        .then(function(response) {
            response.text().then(function(text) {
                var lines = text.split('\n'); // 개행 문자를 기준으로 각 라인을 분리
                var data = [];
                lines.forEach(function(line) {
                    var values = line.split(','); // 쉼표를 기준으로 각 항목을 분리
                    var item = {
                        code: values[1].replace(/\"/g, ''),
                        name: values[2].replace(/\"/g, '')
                    };
                    data.push(item);
                });
                displaySearchResult(data, keyword); // 검색 결과를 화면에 출력
            });
        });
}

// 검색 결과를 화면에 출력하는 함수 & 클릭하면 바로 화면에 출력
function displaySearchResult(data, keyword) {
    var searchResultContainer = document.querySelector(".searchResults"); // 검색 결과를 표시할 컨테이너
    searchResultContainer.innerHTML = ""; // 이전 검색 결과를 지우기
    
    var searchResults = data.filter(function(item) {
        return item.name.includes(keyword); // 검색어가 포함된 항목만 필터링
    });

    if (searchResults.length > 0) {
        searchResults.forEach(function(result) {
            var resultElement = document.createElement("div");
            resultElement.classList.add("searchResultBox"); // 클래스 추가

            var stationNameElement = document.createElement("div");
            stationNameElement.classList.add("stationName"); // 클래스 추가
            stationNameElement.textContent = result.name;
            resultElement.appendChild(stationNameElement);

            var busCodeElement = document.createElement("div");
            busCodeElement.classList.add("busCode"); // 클래스 추가
            busCodeElement.textContent = result.code;
            resultElement.appendChild(busCodeElement);

            // 클릭 이벤트 추가
            resultElement.addEventListener("click", function() {
                // alert("정류소가 선택되었습니다: " + result.name);
                displayBusStationInfo(result.code);
            });

            searchResultContainer.appendChild(resultElement);
        });
    } else {
        searchResultContainer.textContent = "검색 결과가 없습니다.";
    }
}

//// API ////

// api에서
function displayBusStationInfo(station_id) {
    var xhr = new XMLHttpRequest();
    var url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid'; /*URL*/
    var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'Xhhtp6o3z4f7BOdsmlZ94BhZZKweTPbK9SwsaxHQmLhdWTYvOrFdAs4aSD6yPZZSJRh5VBGU2v%2BuABrSXp1bBQ%3D%3D'; /*Service Key*/
    queryParams += '&' + encodeURIComponent('arsId') + '=' + encodeURIComponent(station_id); /**/

    xhr.open('GET', url + queryParams);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            var xmlDoc = this.responseXML;
            makeBusList(xmlDoc);
            // console.log(itemList[0]);
            console.log(xmlDoc)
            window.scrollTo({ top: -4, behavior: 'smooth' }); // 스크롤을 맨 위로 이동
        }
    }
    
    // XMLHttpRequest 요청 보내기
    xhr.send();
}

// 버스리스트 만들기
function makeBusList(xmlDoc) {
    var itemList = xmlDoc.getElementsByTagName('msgBody')[0].getElementsByTagName('itemList');
    var busList = [];
    if (itemList.length > 0) {
        for (var i = 0; i < itemList.length; i++) {
            var bus = {
                'bus_number': itemList[i].getElementsByTagName('busRouteAbrv')[0] ? itemList[i].getElementsByTagName('busRouteAbrv')[0].textContent : "", // 버스 번호
                'arrive_time': itemList[i].getElementsByTagName('arrmsgSec1')[0] ? itemList[i].getElementsByTagName('arrmsgSec1')[0].textContent : "", // 도착 시간
                'current_station': itemList[i].getElementsByTagName('stationNm1')[0] ? itemList[i].getElementsByTagName('stationNm1')[0].textContent : "", // 현재 정류장
                'bus_type': itemList[i].getElementsByTagName('routeType')[0] ? itemList[i].getElementsByTagName('routeType')[0].textContent : ""
            };
            // 버스 종류 이미지 저장
            if (bus.bus_type == 2 || bus.bus_type == 4) {
                bus['bus_type_img'] = 'images/bus_green@400.png'
            }
            else if (bus.bus_type == 3) {
                bus['bus_type_img'] = 'images/bus_blue@400.png'
            }
            else if (bus.bus_type == 5) {
                bus['bus_type_img'] = 'images/bus_yellow@400.png'
            }
            else if (bus.bus_type == 6) {
                bus['bus_type_img'] = 'images/bus_red@400.png'
            }
            else {
                bus['bus_type_img'] = 'images/bus_gray@400.png'
            }

            // 버스 정보를 출력
            console.log("버스 번호: " + bus.bus_number);
            console.log("도착 시간: " + bus.arrive_time);
            console.log("현재 정류장: " + bus.current_station);
            console.log("버스 종류: " + bus.bus_type);

            console.log("버스 종류 이미지" + bus.bus_type_img);
            // console.log(itemList); 

            busList.push(bus);
        }
        // 버스 리스트를 표시
        displayBusInfo(busList);
    } else {
        console.log("No data available");
    }
}
// busInfo에다 정보출려하기
function displayBusInfo(busList) {
    var busInfoContainer = document.querySelector("#busInfo .busResults");

    // 이전에 표시된 버스 정보를 모두 지우기
    busInfoContainer.innerHTML = "";

    // 버스 리스트를 도착 시간이 빠른 순으로 정렬
    busList.sort(function(a, b) {
        // A의 도착 시간이 '곧 도착'인 경우
        if (a.arrive_time === '곧 도착') {
            // A를 위로 올림
            return -1;
        }
        // B의 도착 시간이 '곧 도착'인 경우
        else if (b.arrive_time === '곧 도착') {
            // B를 위로 올림
            return 1;
        }
        // A의 도착 시간이 버스 운행 종류인 경우
        else if (a.arrive_time === '첫 번째 버스 운행종료') {
            // A를 아래로 내림
            return 1;
        }
        // B의 도착 시간이 버스 운행 종류인 경우
        else if (b.arrive_time === '첫 번째 버스 운행종료') {
            // B를 아래로 내림
            return -1;
        }
        else if (b.arrive_time === '첫 번째 버스 출발대기') {
            // B를 아래로 내림
            return -1;
        }
        // A와 B의 도착 시간이 모두 숫자인 경우
        else if (!isNaN(parseFloat(a.arrive_time)) && !isNaN(parseFloat(b.arrive_time))) {
            // 도착 시간이 빠른 순으로 정렬
            return parseFloat(a.arrive_time) - parseFloat(b.arrive_time);
        } 
        // A와 B의 도착 시간이 모두 숫자가 아닌 경우
        else {
            // 그대로 유지
            return 0;
        }
    });

    // 버스 정보를 표시
    busList.forEach(function(bus) {
        var busElement = document.createElement("div");
        busElement.classList.add("busItem");

        var leftContent = document.createElement("div");
        leftContent.classList.add("leftContent");

        // 버스 종류 이미지 추가
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

        if (bus.arrive_time && bus.current_station) { // 현재 정류소 정보가 모두 있을 때만 출력
            var arriveTime = document.createElement("p");
            arriveTime.textContent = "도착 시간: " + bus.arrive_time;
            rightContent.appendChild(arriveTime);

            var currentStation = document.createElement("p");
            currentStation.textContent = "현재 정류장: " + bus.current_station;
            rightContent.appendChild(currentStation);
        } else { // 현재 정류소 정보가 없는 경우에는 도착 시간과 버스 번호만 출력
            var arriveTime = document.createElement("p");
            arriveTime.textContent = "도착 시간: " + bus.arrive_time;
            rightContent.appendChild(arriveTime);
        }
        
        busElement.appendChild(rightContent);
        
        busElement.appendChild(leftContent);
        busInfoContainer.appendChild(busElement);
    });
}

