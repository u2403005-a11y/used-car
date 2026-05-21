from flask import Flask, render_template, request, jsonify
import pickle
import pandas as pd
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'car_price_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')

model = None
scaler = None
load_error = None

try:
    with open(MODEL_PATH, 'rb') as model_file:
        model = pickle.load(model_file)
    with open(SCALER_PATH, 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
except Exception as err:
    load_error = str(err)


def generate_model_suggestion(year, kms_driven, predicted_price):
    """Generate car model suggestions based on year, mileage, and predicted price."""
    
    # Price tier mapping for better recommendations
    price_range = predicted_price if predicted_price > 0 else 500000
    
    # Premium Range (> 25 Lakh)
    if price_range > 2500000:
        if year >= 2020 and kms_driven <= 30000:
            return 'BMW i5, Mercedes-Benz C-Class, Audi A4'
        if year >= 2018 and kms_driven <= 60000:
            return 'Jaguar XE, Volkswagen Passat, Skoda Superb'
        return 'BMW 3 Series, Audi A3, Mercedes A-Class'
    
    # Upper Mid Range (15 - 25 Lakh)
    if price_range > 1500000:
        if year >= 2020 and kms_driven <= 35000:
            return 'Hyundai Creta, Kia Seltos, MG Hector'
        if year >= 2018 and kms_driven <= 70000:
            return 'Mahindra XUV500, Tata Harrier, Citroen C5 Aircross'
        return 'Renault Duster, Hyundai Tucson, Kia Niro'
    
    # Mid Range (10 - 15 Lakh)
    if price_range > 1000000:
        if year >= 2019 and kms_driven <= 50000:
            return 'Hyundai i20, Maruti Suzuki Baleno, Honda Jazz'
        if year >= 2017 and kms_driven <= 80000:
            return 'Maruti Suzuki Swift, Honda Amaze, Hyundai Grand i10'
        return 'Tata Altroz, Volkswagen Polo, Skoda Rapid'
    
    # Budget Range (5 - 10 Lakh)
    if price_range > 500000:
        if year >= 2018 and kms_driven <= 80000:
            return 'Maruti Suzuki Celerio, Hyundai Santro, Tata Tiago'
        return 'Maruti Suzuki Alto 800, Renault Kwid, Datsun Go'
    
    # Economy Range (< 5 Lakh)
    return 'Maruti Suzuki Alto, Hyundai Eon, Tata Nano'


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    if load_error:
        return jsonify({'error': 'Model load failed: {}'.format(load_error)}), 500

    payload = request.get_json(force=True)
    year = payload.get('year')
    kms_driven = payload.get('kms_driven')

    try:
        year = int(year)
        kms_driven = float(kms_driven)
    except (TypeError, ValueError):
        return jsonify({'error': 'Year and kilometers must be numeric values.'}), 400

    if year <= 0 or kms_driven < 0:
        return jsonify({'error': 'Please enter valid positive values.'}), 400

    try:
        sample = pd.DataFrame({'year': [year], 'kms_driven': [kms_driven]})
        sample_scaled = scaler.transform(sample)
        prediction = model.predict(sample_scaled)
        predicted_value = max(float(prediction[0]), 0.0)
        suggestion = generate_model_suggestion(year, kms_driven, predicted_value)
        return jsonify({
            'prediction': round(predicted_value, 2),
            'model_suggestion': suggestion
        })
    except Exception as err:
        return jsonify({'error': 'Prediction failed: {}'.format(err)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
