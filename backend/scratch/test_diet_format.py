import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-3-flash-preview')
    
    context = "Recent sleep: Average 6.5 hours per night, quality rating 2.5/5. Productivity score: 4.5/10."
    allergy_context = "User Allergies/Restrictions: Peanuts, Dairy"
    
    prompt = f"""You are an expert AI Nutritionist and Wellness Coach. 
Analyze the user's data to provide a personalized daily diet plan.

{context}
{allergy_context}

Based on their sleep patterns and productivity/energy levels, provide a structured plan following this exact format:

**🍳 Breakfast**
- List items here...

**🍱 Lunch**
- List items here...

**🍽️ Dinner**
- List items here...

**🍎 Snacks & Hydration**
- List items here...

**⚠️ Special Considerations & Avoidance**
- Mention their specific allergies and why some foods should be avoided based on their recent energy levels.

Keep the advice practical for a student. Use clear bullet points and bold headings. Be concise but structured. """

    try:
        response = model.generate_content(prompt)
        print("Generated Structured Plan:\n")
        print(response.text.strip())
    except Exception as e:
        print(f"Error: {e}")
else:
    print("API Key not found")
