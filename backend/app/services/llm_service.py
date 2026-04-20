import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_overall_feedback(exercise_name, exercise_map_start,exercise_map_mid,exercise_map_end):

    prompt = f"""
    You are a professional fitness coach analyzing a user's exercise performance.

        Exercise: {exercise_name}

        You are given posture correction feedback with frequency counts:
        - Start phase: {exercise_map_start}
        - Mid phase: {exercise_map_mid}
        - End phase: {exercise_map_end}
        (it might be a case when enough time hasn't pass, you might not get mid phase or end phase, so give the feedback on the basis of provided maps only)

        Instructions:
        1. Identify the most frequent mistakes in the start phase.
        2. Compare how those mistakes changed in mid and end phases.
        3. Highlight improvement or lack of improvement.
        4. Mention only the most important 1–2 posture issues.
        5. Give short, actionable advice for improvement.
        6. If there are no mid map or end map, make the advice as per the given maps 

        Output style:
        - 3–5 sentences maximum
        - Supportive and constructive tone
        - Sound like a real gym coach
        - Avoid generic advice
        - Don't add the numbers in the explaination
        - Keep the language eastily understandable, don't add jargons.

        Example tone:
        "You started with inconsistent back posture, but improved stability by the end. Make sure you to maintiain your back in the correct position"

        Now generate the feedback
    """

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": "You are an AI fitness coach giving concise constructive feedback."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    content = completion.choices[0].message.content
    return content


def generate_overall_feedback_from_sessions(feedback_list):

    combined = " ".join(feedback_list)

    prompt = f"""
    These are workout feedback summaries from multiple exercise sessions:

        {combined}

    Based on this data, generate an overall fitness report that highlights progress and areas for improvement. The response should be written in a single paragraph, use very simple and easy-to-understand language, and must not exceed 200 words. Do not use tables or bullet points.
    
    """

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": "You are an AI fitness coach helping users improve their exercise form."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_completion_tokens=500
    )

    return completion.choices[0].message.content
