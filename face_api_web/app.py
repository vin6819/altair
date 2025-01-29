from flask import Flask, jsonify, request, send_file, Response
import pymongo
from urllib.parse import quote_plus
from bson import json_util, ObjectId
import json
from flask_cors import CORS
import datetime
import geopy.distance
import gridfs
from io import BytesIO
import base64



app = Flask(__name__)
CORS(app)
database_username = "anujjsengar"
database_password = "Anuj@082004"
encoded_username_database = quote_plus(database_username)
encoded_password_database = quote_plus(database_password)

connection_string = f"mongodb+srv://{encoded_username_database}:{encoded_password_database}@anujjsengar.2ordy.mongodb.net/demo?retryWrites=true&w=majority"
client = pymongo.MongoClient(connection_string)

db = client['Project']
student = db['student_table']
mapped_class = db['Mapped_Class']
room_data = db['Room_data']
# {'_id': ObjectId('6735e6d88f4d8e8025763d25'), 'Class_ID': 10, 'Section': '3', 'Room': '304', 'Date': '2025-02-12', 'Time': '10:25'}
# {'_id': ObjectId('67363c0ba3d4ab98507a9ad3'), 'Class_ID': 11, 'Section': '2', 'Room': '250', 'Date': '2024-11-30', 'Time': '04:40'}

def parse_json(data):
    return json.loads(json_util.dumps(data))

@app.route('/search/<int:roll_no>', methods=['GET'])
def search_roll_no(roll_no):
    student_data = student.find_one({"Roll_no": roll_no})
    # print(student_data)
    if student_data:
        curr = {}
        curr['Section'] = student_data['Section']
        current_time = datetime.datetime.now()
        curr['year'] = current_time.year
        curr['month'] = current_time.month
        curr['day'] = current_time.day
        curr['hour'] = current_time.hour
        day = str(curr['year']) + "-" + str(curr['month']) + "-" + str(curr['day'])
        hour = str(curr['hour'])
        hour = hour if len(hour) == 2 else f"0{hour}"
        # print(day , hour)
        #############################################

        day = '2025-02-12'
        hour = '10'
        curr['Section'] = '3'

        #############################################
        found = False
        temp = mapped_class.find()
        room = ""
        for i in temp:
            # print(i['Date'])
            if i['Date'] == day and (i['Time']).startswith(hour) and i['Section'] == curr['Section']:
                room = i['Room']
                found = True
                break
        ##############################################

        room = "325"
        
        ##############################################
        if found:
            lat1 = request.args.get('lat', type=float)
            lon1 = request.args.get('lng', type=float)
            rl = room_data.find_one({'room_no':room})
            lat2 = rl['lat']
            lon2 = rl['long']
            coords1 = (lat1, lon1)
            coords2 = (lat2, lon2)
            distance = geopy.distance.geodesic(coords1, coords2).km
            print(distance)
            if distance > 100:
                found = False
        res = {}
        if found:
            res['found'] = True
        return parse_json(res), 200
    else:
        return jsonify({"message": "Student not found"}), 404

# fs = gridfs.GridFS(db)

@app.route('/get-image/<image_id>', methods=['GET'])
def get_image(image_id):
    # print(11)
    try:
        # print(list(student.find()))
        student_data = student.find_one({"Roll_no": int(image_id)})
        # print(student_data)
        # print(1111)
        object_id = student_data.get('Image')
        # print(object_id)
        if object_id:
            img_buffer = BytesIO(object_id)
            return send_file(img_buffer, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": str(e)}), 404

if __name__ == '__main__':
    app.run(debug=True, port=8000)  
