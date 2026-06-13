
from transformers import AutoModelForCausalLM, AutoTokenizer
import os
from dotenv import load_dotenv

load_dotenv()

model_name = "meta-llama/Llama-2-7b-chat-hf" 
hugging_face_token = os.getenv("HUGGING_FACE_HUB_TOKEN")

print(f"Loading tokenizer for {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name, token=hugging_face_token)

print(f"Loading model for {model_name}...")
model = AutoModelForCausalLM.from_pretrained(model_name, token=hugging_face_token)

print("Model and tokenizer loaded successfully!")

print("\nTesting the model...")
inputs = tokenizer("Hello, LLaMA!", return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)
print(tokenizer.decode(outputs[0]))

print("\nSaving model and tokenizer locally...")
local_dir = "./models/llama-2-7b-chat-hf"
os.makedirs(local_dir, exist_ok=True)
model.save_pretrained(local_dir)
tokenizer.save_pretrained(local_dir)
print(f"Model saved locally at {local_dir}")
