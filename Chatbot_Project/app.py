
from flask import Flask, request, jsonify
import nltk
from nltk.stem import WordNetLemmatizer
import json
import pickle
import numpy as np
from flask import Flask, render_template
from tensorflow.keras.models import load_model


import random  # Import the random module

app = Flask(__name__, static_folder='static', template_folder='templates')

# Load your pre-trained chatbot model and necessary data
queries = json.loads(open('queries.json').read())
words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = load_model('chatbot_model.h5')

lemmatizer = WordNetLemmatizer()

def clean_up_sentence(sentence):
    # Tokenize the sentence
    sentence_words = nltk.word_tokenize(sentence)
    # Lemmatize and lower each word
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=True):
    # Tokenize and lemmatize the user input
    sentence_words = clean_up_sentence(sentence)
    # Create a bag of words array
    bag = [0]*len(words)
    for s in sentence_words:
        for i, word in enumerate(words):
            if word == s:
                bag[i] = 1
    return(np.array(bag))

def predict_class(sentence):
    # Predict the category of the user input
    p = bow(sentence, words)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"query": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(queries_list, queries_json):
    tag = queries_list[0]['query']
    list_of_queries = queries_json['queries']
    for i in list_of_queries:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            break
    return result
@app.route('/')

def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json['message']
    ints = predict_class(message)
    res = get_response(ints, queries)
    response = {
        'message': res
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
