from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images(
            "apps/cse40/expected_images/harris_sharp_input_image.png",
            "apps/feature-detection/output_images/harris_sharp_input_image.png"
        )
        print("harris_corners: {} marks".format(score))
        if score < 95:
            print("harris_corners: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("harris_corners: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("harris_corners: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
