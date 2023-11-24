import torch
def predict_sic_code(text, model, tokenizer, label_encoder, top_k=3):
    # Preprocess input text
    input_text = text.lower().strip()

    # Tokenize input text
    input_encodings = tokenizer(input_text, truncation=True, padding=True, max_length=124, return_tensors="pt")

    # Predict label
    with torch.no_grad():
        outputs = model(**input_encodings)
        logits = outputs.logits
        probabilities = torch.nn.functional.softmax(logits, dim=1)
        top_k_values, top_k_indices = torch.topk(probabilities, top_k)

    # Decode indices to SIC codes and return results
    top_k_sic_codes = label_encoder.inverse_transform(top_k_indices.squeeze().tolist())
    top_k_certainties = top_k_values.squeeze().tolist()

    # Convert SIC codes to strings
    top_k_sic_codes_str = [sic_code for sic_code in top_k_sic_codes]

    return list(zip(top_k_sic_codes_str, top_k_certainties))