import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_overall_feedback(feedback):

    # feedback is a list of FeedbackItem objects
    messages = [f.message for f in feedback]

    combined = " ".join(messages)

    prompt = f"""
    These are posture correction messages during a workout:

    {combined}

    Generate short constructive feedback for the user like a fitness coach.
    """

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": "You are an AI fitness coach giving concise constructive feedback."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_completion_tokens=300
    )

    return completion.choices[0].message.content



def generate_overall_feedback_from_sessions(feedback_list):

    combined = " ".join(feedback_list)

    prompt = f"""
    These are workout feedback summaries from multiple exercise sessions:

    {combined}

    Generate overall fitness advice describing improvement areas and progress.
    """

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "system", "content": "You are an AI fitness coach helping users improve their exercise form."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_completion_tokens=400
    )

    return completion.choices[0].message.content