<<<<<<< HEAD
# Used Car Price Predictor

A simple Flask web app for predicting used car prices based on the car year and kilometers driven.

## Features

- Predicts car price from year and kilometers driven
- Returns a recommended set of car models based on price tier, year, and mileage
- Provides a browser interface via `templates/index.html`

## Requirements

- Python 3.11+ (or compatible Python 3 version)
- Flask
- pandas
- scikit-learn
- numpy
- gunicorn (optional for production)

Dependencies are listed in `requirements.txt`.

## Setup

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure the trained model files exist in the project root:
   - `car_price_model.pkl`
   - `scaler.pkl`

## Running locally

From the project directory:

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000/
```

## API Endpoints

- `GET /` - Loads the main HTML interface
- `POST /predict` - Performs a price prediction

### Predict request body

```json
{
  "year": 2018,
  "kms_driven": 50000
}
```

### Predict response

```json
{
  "prediction": 420000.0,
  "model_suggestion": "Hyundai i20, Maruti Suzuki Baleno, Honda Jazz"
}
```

## Notes

- The app expects numeric values for `year` and `kms_driven`.
- If the model or scaler fails to load, the `/predict` endpoint returns an error.

## Project structure

- `app.py` - Flask application and prediction logic
- `requirements.txt` - Python dependencies
- `templates/index.html` - Frontend UI template
- `static/script.js` - Client-side prediction request logic
- `static/style.css` - Page styling

## License

This project is provided as-is for demonstration purposes.
=======
https://used-car-1.onrender.com/
>>>>>>> e7013264ad9d71d67be6175b04d0b17267b2b95c
