from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images("apps/cse40/expected_images/emboss_image.png", "apps/basic-processing/output_images/emboss_image.png")
        print("embossed_standard: {} marks".format(score))
        if score < 95:
            print("embossed_standard: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("embossed_standard: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("embossed_standard: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
