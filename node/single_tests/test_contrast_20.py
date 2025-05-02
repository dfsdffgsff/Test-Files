from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images("apps/cse40/expected_images/contrast_20_image.png", "apps/basic-processing/output_images/contrast_20_image.png")
        print("contrast_20: {} marks".format(score))
        if score < 95:
            print("contrast_20: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("contrast_20: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("contrast_20: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
