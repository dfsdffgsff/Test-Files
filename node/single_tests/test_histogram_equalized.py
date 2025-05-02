from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images(
            "apps/cse40/expected_images/histogram_equalized.png",
            "apps/enhancement/output_images/histogram_equalized.png"
        )
        print("histogram_equalized: {} marks".format(score))
        if score < 95:
            print("histogram_equalized: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("histogram_equalized: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("histogram_equalized: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()
