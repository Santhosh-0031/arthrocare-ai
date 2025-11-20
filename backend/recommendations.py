from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app)

print("🚀 Starting Recommendations API...")

# Load your ML model for risk calculation
model = None
scaler = None

def load_models():
    """Load your trained RA model for risk calculation"""
    global model, scaler
    try:
        print("🔄 Loading ML model for recommendations...")
        
        possible_model_paths = [
            "./models/RA_model.pkl",
            "RA_model.pkl", 
            "../models/RA_model.pkl"
        ]
        
        possible_scaler_paths = [
            "./models/scaler.pkl",
            "scaler.pkl",
            "../models/scaler.pkl"
        ]
        
        # Load model
        for model_path in possible_model_paths:
            if os.path.exists(model_path):
                model = joblib.load(model_path)
                print(f"✅ Model loaded from: {model_path}")
                break
        
        # Load scaler
        for scaler_path in possible_scaler_paths:
            if os.path.exists(scaler_path):
                scaler = joblib.load(scaler_path)
                print(f"✅ Scaler loaded from: {scaler_path}")
                break
                
    except Exception as e:
        print(f"❌ Error loading models: {e}")

load_models()

# Helper functions
def biomarker_flag(age, gender_num, ESR, CRP, RF, Anti_CCP):
    """Calculate biomarker flags"""
    # ESR
    if age < 18:
        esr_flag = 0 if ESR < 10 else (1 if ESR <= 20 else 2)
    elif age <= 60:
        if gender_num == 1:  # male
            esr_flag = 0 if ESR < 15 else (1 if ESR <= 30 else 2)
        else:
            esr_flag = 0 if ESR < 20 else (1 if ESR <= 40 else 2)
    else:
        esr_flag = 0 if ESR < 30 else (1 if ESR <= 50 else 2)

    # CRP
    if age < 18:
        crp_flag = 0 if CRP < 5 else (1 if CRP <= 10 else 2)
    elif age <= 60:
        crp_flag = 0 if CRP < 6 else (1 if CRP <= 20 else 2)
    else:
        crp_flag = 0 if CRP < 10 else (1 if CRP <= 30 else 2)

    # RF
    if age < 18:
        rf_flag = 0 if RF < 10 else (1 if RF <= 20 else 2)
    elif age <= 60:
        rf_flag = 0 if RF < 14 else (1 if RF <= 30 else 2)
    else:
        rf_flag = 0 if RF < 20 else (1 if RF <= 40 else 2)

    # Anti-CCP
    accp_flag = 0 if Anti_CCP < 20 else (1 if Anti_CCP < 40 else 2)

    return {'ESR_flag': esr_flag, 'CRP_flag': crp_flag, 'RF_flag': rf_flag, 'AntiCCP_flag': accp_flag}

def adjust_by_age_gender(row):
    """Feature engineering for ML model"""
    age = row['Age']
    gender = row['Gender']
    ESR = row['ESR']
    CRP = row['CRP']
    RF = row['RF']
    Anti_CCP = row['Anti-CCP']

    # ESR Adjustment
    if age < 18:
        esr_adj = 0 if ESR < 10 else (1 if ESR <= 20 else 2)
    elif age <= 60:
        if gender == 1:  # Male
            esr_adj = 0 if ESR < 15 else (1 if ESR <= 30 else 2)
        else:  # Female
            esr_adj = 0 if ESR < 20 else (1 if ESR <= 40 else 2)
    else:
        esr_adj = 0 if ESR < 30 else (1 if ESR <= 50 else 2)

    # CRP Adjustment
    if age < 18:
        crp_adj = 0 if CRP < 5 else (1 if CRP <= 10 else 2)
    elif age <= 60:
        crp_adj = 0 if CRP < 6 else (1 if CRP <= 20 else 2)
    else:
        crp_adj = 0 if CRP < 10 else (1 if CRP <= 30 else 2)

    # RF Adjustment
    if age < 18:
        rf_adj = 0 if RF < 10 else (1 if RF <= 20 else 2)
    elif age <= 60:
        rf_adj = 0 if RF < 14 else (1 if RF <= 30 else 2)
    else:
        rf_adj = 0 if RF < 20 else (1 if RF <= 40 else 2)

    # Anti-CCP Adjustment
    anticcp_adj = 0 if Anti_CCP < 20 else (1 if Anti_CCP < 40 else 2)

    row['ESR_adj'] = esr_adj
    row['CRP_adj'] = crp_adj
    row['RF_adj'] = rf_adj
    row['AntiCCP_adj'] = anticcp_adj
    return row

def compute_risk_score(row):
    """Calculate risk score using your exact logic"""
    age = int(row.get('Age', 30))
    gender = int(row.get('Gender', 0))
    ESR = float(row.get('ESR', 0) or 0)
    CRP = float(row.get('CRP', 0) or 0)
    RF = float(row.get('RF', 0) or 0)
    Anti_CCP = float(row.get('Anti-CCP', 0) or 0)
    smoke = int(row.get('SmokingStatus', 0))
    drink_cat = str(row.get('DrinkingStatus', 'Almost non-drinker'))

    flags = biomarker_flag(age, gender, ESR, CRP, RF, Anti_CCP)
    inflammation_points = flags['ESR_flag'] + flags['CRP_flag'] + flags['RF_flag'] + flags['AntiCCP_flag']

    smoke_points = {0: 0, 1: 1, 2: 2}.get(smoke, 0)
    drink_points = 0 if drink_cat == 'Almost non-drinker' else (1 if drink_cat == 'Occasional drinker' else 2)
    age_points = 2 if age > 60 else (1 if age >= 45 else 0)
    ra_flag = 1 if int(row.get('RheumatoidArthritis', 0)) == 1 else 0

    base = inflammation_points * 3 + smoke_points * 2 + drink_points * 1 + age_points * 2 + ra_flag * 4
    denom = (8 * 3 + 2 * 2 + 2 + 4)
    rule_score = min(100, round((base / denom) * 100, 2))

    model_prob = None
    if model is not None and scaler is not None:
        try:
            tmp = pd.DataFrame([{'Age': age, 'Gender': gender, 'ESR': ESR, 'CRP': CRP, 'RF': RF, 'Anti-CCP': Anti_CCP}])
            tmp = tmp.apply(adjust_by_age_gender, axis=1)
            features = ['Age', 'Gender', 'ESR', 'CRP', 'RF', 'Anti-CCP', 'ESR_adj', 'CRP_adj', 'RF_adj', 'AntiCCP_adj']
            Xs = scaler.transform(tmp[features])
            model_prob = float(model.predict_proba(Xs)[0][1])
        except Exception:
            model_prob = None

    if model_prob is not None:
        combined = round((0.55 * (rule_score / 100) + 0.45 * model_prob) * 100, 2)
    else:
        combined = rule_score

    return {'rule_score': rule_score, 'model_prob': model_prob, 'combined_score': combined, 'flags': flags}

# Recommendation functions
def get_diet_recommendations(age, gender, flags, smoke, drink_cat, ra_flag, vegetarian):
    """Generate personalized diet recommendations"""
    recommendations = {
        "title": "Anti-Inflammatory Diet Plan 🍎",
        "sections": []
    }
    
    # Core principles
    core_principles = {
        "title": "Core Dietary Principles",
        "items": [
            "Focus on omega-3 rich foods: fatty fish (salmon, mackerel) 2x/week or flaxseed/chia for vegetarians",
            "Include 5+ servings of colorful fruits and vegetables daily",
            "Choose whole grains over refined carbohydrates",
            "Use healthy fats: olive oil, avocado, nuts, and seeds",
            "Stay hydrated with water and herbal teas"
        ]
    }
    recommendations["sections"].append(core_principles)
    
    # Specific recommendations based on biomarkers
    biomarker_advice = {
        "title": "Targeted Nutrition Based on Your Markers",
        "items": []
    }
    
    if flags['ESR_flag'] >= 1 or flags['CRP_flag'] >= 1:
        biomarker_advice["items"].append("High inflammation detected: Increase turmeric, ginger, and green tea intake")
    
    if flags['RF_flag'] >= 1 or flags['AntiCCP_flag'] >= 1:
        biomarker_advice["items"].append("RA markers present: Consider reducing processed foods and increasing antioxidant-rich foods")
    
    if age < 30:
        biomarker_advice["items"].append("Young adult: Focus on building healthy eating habits for long-term joint health")
    
    if smoke > 0:
        biomarker_advice["items"].append("Smoker: Increase vitamin C rich foods (citrus, bell peppers) to combat oxidative stress")
    
    if vegetarian:
        biomarker_advice["items"].append("Vegetarian: Ensure adequate protein from legumes, tofu, and dairy; consider B12 supplementation")
    
    recommendations["sections"].append(biomarker_advice)
    
    return recommendations

def get_exercise_recommendations(age, severity, flags, smoke):
    """Generate personalized exercise recommendations"""
    recommendations = {
        "title": "Personalized Exercise Plan 💪",
        "sections": []
    }
    
    # Severity-based exercise plan
    if severity in ['Severe', 'Severe - Urgent']:
        exercise_plan = {
            "title": "Gentle Movement Program",
            "items": [
                "Daily range-of-motion exercises: 10-15 minutes",
                "Seated strengthening with light resistance bands",
                "Aquatic therapy if available (reduces joint stress)",
                "Avoid high-impact activities and heavy lifting"
            ]
        }
    elif severity == 'Moderate':
        exercise_plan = {
            "title": "Balanced Activity Program",
            "items": [
                "Low-impact cardio: walking, cycling 20-30 minutes, 4-5x/week",
                "Strength training: light weights or resistance bands 2x/week",
                "Flexibility: daily stretching and yoga 1-2x/week",
                "Listen to your body - rest when needed"
            ]
        }
    else:
        exercise_plan = {
            "title": "Active Prevention Program",
            "items": [
                "Regular aerobic exercise: 30 minutes most days",
                "Strength training: 2x/week focusing on major muscle groups",
                "Balance and flexibility exercises",
                "Stay active with activities you enjoy"
            ]
        }
    
    recommendations["sections"].append(exercise_plan)
    
    # Safety tips
    safety_tips = {
        "title": "Exercise Safety Tips",
        "items": [
            "Warm up properly before exercise",
            "Start slowly and gradually increase intensity",
            "Stop if you experience sharp pain",
            "Use proper form to protect joints",
            "Stay hydrated during exercise"
        ]
    }
    recommendations["sections"].append(safety_tips)
    
    return recommendations

def get_lifestyle_recommendations(age, severity, smoke, drink_cat, weight_kg):
    """Generate lifestyle recommendations"""
    recommendations = {
        "title": "Holistic Lifestyle Guidance 🌱",
        "sections": []
    }
    
    # Sleep and stress
    sleep_stress = {
        "title": "Sleep & Stress Management",
        "items": [
            "Aim for 7-9 hours of quality sleep nightly",
            "Maintain consistent sleep schedule",
            "Practice relaxation techniques: meditation, deep breathing",
            "Limit screen time before bed",
            "Create a relaxing bedtime routine"
        ]
    }
    recommendations["sections"].append(sleep_stress)
    
    # Hydration and habits
    hydration = {
        "title": "Hydration & Healthy Habits",
        "items": []
    }
    
    if weight_kg:
        water_need = round((35 * weight_kg) / 1000, 1)
        hydration["items"].append(f"Daily hydration goal: {water_need}L based on your weight")
    else:
        hydration["items"].append("Daily hydration: 2-3L of water")
    
    hydration["items"].append("Choose water, herbal teas over sugary drinks")
    
    if smoke > 0:
        hydration["items"].append("Smoking cessation is strongly recommended for RA management")
    
    if drink_cat != 'Almost non-drinker':
        hydration["items"].append("Limit alcohol intake as it can increase inflammation")
    
    recommendations["sections"].append(hydration)
    
    return recommendations

def get_mental_wellness_recommendations(severity, age):
    """Generate mental wellness recommendations"""
    recommendations = {
        "title": "Mental Wellness & Support 🧠",
        "sections": []
    }
    
    mind_body = {
        "title": "Mind-Body Practices",
        "items": [
            "Daily mindfulness meditation: 10-15 minutes",
            "Deep breathing exercises during stressful moments",
            "Progressive muscle relaxation techniques",
            "Gentle yoga or tai chi for mind-body connection"
        ]
    }
    recommendations["sections"].append(mind_body)
    
    # Support and coping
    support = {
        "title": "Support & Coping Strategies",
        "items": [
            "Join RA support groups (online or local)",
            "Practice pacing: balance activity with rest",
            "Keep a symptom journal to identify patterns",
            "Communicate openly with healthcare providers",
            "Set realistic goals and celebrate small victories"
        ]
    }
    
    if age < 30:
        support["items"].append("Connect with other young adults managing RA")
    
    if severity in ['Severe', 'Moderate']:
        support["items"].append("Consider speaking with a mental health professional about coping strategies")
    
    recommendations["sections"].append(support)
    
    return recommendations

@app.route('/api/generate-recommendations', methods=['POST', 'OPTIONS'])
def generate_recommendations():
    print("🎯 RECOMMENDATIONS ENDPOINT CALLED!")
    
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        print(f"📥 Received data for recommendations: {data}")
        
        if not data:
            return jsonify({'error': 'No data received'}), 400

        # Extract and validate data
        required_fields = ['age', 'gender', 'smokingStatus', 'drinkingStatus', 'rheumatoidArthritis']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        age = int(data['age'])
        gender_input = str(data['gender']).strip().upper()
        gender_num = 1 if gender_input in ['M', 'MALE'] else 0
        gender_str = 'Male' if gender_num == 1 else 'Female'
        
        smoke_input = str(data['smokingStatus']).strip().title()
        smoke_map = {'Never': 0, 'Former': 1, 'Current': 2, 'No': 0, 'Quit': 1, 'Yes': 2}
        smoke_num = smoke_map.get(smoke_input, 0)
        
        drink_input = str(data['drinkingStatus']).strip().title()
        drink_map = {'Never': 'Almost non-drinker', 'Moderate': 'Occasional drinker', 'Regular': 'Frequent drinker'}
        drink_cat = drink_map.get(drink_input, 'Almost non-drinker')
        
        ra_flag = int(data['rheumatoidArthritis'])
        
        # Optional fields with defaults
        ESR = float(data.get('ESR', 0) or 0)
        CRP = float(data.get('CRP', 0) or 0)
        RF = float(data.get('RF', 0) or 0)
        Anti_CCP = float(data.get('AntiCCP', 0) or 0)
        weight_kg = data.get('weight')
        vegetarian = bool(data.get('vegetarian', False))

        # Compute risk score
        risk_data = {
            'Age': age, 'Gender': gender_num, 'ESR': ESR, 'CRP': CRP, 'RF': RF, 'Anti-CCP': Anti_CCP,
            'SmokingStatus': smoke_num, 'DrinkingStatus': drink_cat, 'RheumatoidArthritis': ra_flag
        }
        
        risk_result = compute_risk_score(risk_data)
        combined_score = risk_result['combined_score']
        flags = risk_result['flags']

        # Determine severity
        if combined_score >= 85:
            severity = 'Severe - Urgent'
        elif combined_score >= 70:
            severity = 'Severe'
        elif combined_score >= 55:
            severity = 'Moderate'
        elif combined_score >= 35:
            severity = 'Borderline'
        else:
            severity = 'Low/Normal'

        # Generate all recommendations
        diet_rec = get_diet_recommendations(age, gender_num, flags, smoke_num, drink_cat, ra_flag, vegetarian)
        exercise_rec = get_exercise_recommendations(age, severity, flags, smoke_num)
        lifestyle_rec = get_lifestyle_recommendations(age, severity, smoke_num, drink_cat, weight_kg)
        mental_rec = get_mental_wellness_recommendations(severity, age)

        # Compile final response
        response = {
            'patientSummary': {
                'age': age,
                'gender': gender_str,
                'severity': severity,
                'riskScore': combined_score,
                'modelProbability': risk_result['model_prob'],
                'inflammatoryMarkers': flags
            },
            'recommendations': {
                'diet': diet_rec,
                'exercise': exercise_rec,
                'lifestyle': lifestyle_rec,
                'mentalWellness': mental_rec
            },
            'keyMessages': [
                "These recommendations are personalized based on your health profile",
                "Consult with healthcare providers before making significant changes",
                "Regular monitoring and follow-up are essential for RA management"
            ]
        }

        print("✅ Recommendations generated successfully!")
        return jsonify(response)

    except Exception as e:
        print(f"❌ Error generating recommendations: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Failed to generate recommendations: {str(e)}'}), 500

@app.route('/api/recommendations-health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Recommendations API is running',
        'model_loaded': model is not None,
        'endpoints': ['POST /api/generate-recommendations']
    })

if __name__ == '__main__':
    print("🔥 Recommendations API Starting...")
    print("📍 Endpoint: POST /api/generate-recommendations")
    print("📍 Health: GET /api/recommendations-health")
    print("🚀 Starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)