from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images(
            "apps/cse40/expected_images/sharpened_image.png",
            "apps/basic-processing/output_images/sharpened_image.png"
        )
        print("sharpened_image: {} marks".format(score))
        if score < 95:
            print("sharpened_image: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("sharpened_image: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("sharpened_image: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
