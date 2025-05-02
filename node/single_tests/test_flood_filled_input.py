from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images("apps/cse40/expected_images/flood_filled_input_image.png", "apps/enhancement/output_images/flood_filled_input_image.png")
        print("flood_filled_input: {} marks".format(score))
        if score < 99.99:
            print("flood_filled_input: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("flood_filled_input: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("flood_filled_input: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
