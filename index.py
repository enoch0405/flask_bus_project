from flask import Flask, jsonify, request, render_template
import csv, requests
import xml.etree.ElementTree as ET

app = Flask(__name__)


# csv파일 가져오기
def load_station_data():
    stations = []
    with open('data/서울시버스정류소위치정보utf.csv', encoding='utf-8') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header
        for row in reader:
            stations.append({'code': row[1].replace('"', ''), 'name': row[2].replace('"', '')})
    return stations

# CSV 데이터를 JSON 형식으로 제공
@app.route('/api/stations')
def get_stations():
    keyword = request.args.get('keyword', '')
    stations = load_station_data()
    if keyword:
        stations = [station for station in stations if keyword in station['name']]
    return jsonify(stations)

# 외부 API 호출 함수
def fetch_bus_station_info(station_id):
    url = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid'
    queryParams = '?' + 'serviceKey=Xhhtp6o3z4f7BOdsmlZ94BhZZKweTPbK9SwsaxHQmLhdWTYvOrFdAs4aSD6yPZZSJRh5VBGU2v%2BuABrSXp1bBQ%3D%3D'
    queryParams += '&arsId=' + station_id
    response = requests.get(url + queryParams)

    if response.status_code == 200:
        return response.content
    else:
        return None

# XML 데이터를 파싱하여 JSON으로 변환하는 함수
def parse_bus_station_info(xml_data):
    root = ET.fromstring(xml_data)
    itemList = root.find('msgBody').findall('itemList')
    bus_list = []

    for item in itemList:
        bus = {
            'bus_number': item.find('busRouteAbrv').text if item.find('busRouteAbrv') is not None else "",
            'arrive_time': item.find('arrmsgSec1').text if item.find('arrmsgSec1') is not None else "",
            'current_station': item.find('stationNm1').text if item.find('stationNm1') is not None else "",
            'bus_type': item.find('routeType').text if item.find('routeType') is not None else ""
        }

        if bus['bus_type'] in ['2', '4']:
            bus['bus_type_img'] = 'static/images/bus_green@400.png'
        elif bus['bus_type'] == '3':
            bus['bus_type_img'] = 'static/images/bus_blue@400.png'
        elif bus['bus_type'] == '5':
            bus['bus_type_img'] = 'static/images/bus_yellow@400.png'
        elif bus['bus_type'] == '6':
            bus['bus_type_img'] = 'static/images/bus_red@400.png'
        else:
            bus['bus_type_img'] = 'static/images/bus_gray@400.png'

        bus_list.append(bus)

    return bus_list


# 메인화면
@app.route('/')
def index():
    return render_template('index.html')

# 버스정보
@app.route('/api/bus_info')
def get_bus_info():
    station_id = request.args.get('station_id')
    xml_data = fetch_bus_station_info(station_id)

    if xml_data:
        bus_list = parse_bus_station_info(xml_data)
        return jsonify(bus_list)
    else:
        return jsonify([])

# 실행
app.run(debug=True)
