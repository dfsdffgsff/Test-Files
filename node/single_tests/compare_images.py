from PIL import Image
import numpy as np

def compare_images(expected_path, generated_path):
    # Load images
    expected = Image.open(expected_path).convert('RGB')
    generated = Image.open(generated_path).convert('RGB')
    
    # Check if images have the same size
    if expected.size != generated.size:
        print(f"Size mismatch: {expected.size} vs {generated.size}")
        return 0

    # Convert to NumPy arrays
    expected_arr = np.array(expected)
    generated_arr = np.array(generated)
    
    # Compare pixel-wise equality
    matches = np.all(expected_arr == generated_arr, axis=-1)  # True where pixel matches (R, G, B all)
    correct_pixels = np.sum(matches)
    total_pixels = matches.size
    
    # Calculate score
    score = (correct_pixels / total_pixels) * 100
    return score