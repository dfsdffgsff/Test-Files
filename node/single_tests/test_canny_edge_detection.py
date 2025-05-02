from compare_images import compare_images
import sys

def main():
    try:
        score = compare_images("apps/cse40/expected_images/canny_edges.png", "apps/feature-detection/output_images/canny_edges.png")
        print("canny_edge_detection: {} marks".format(score))
        if score < 99.5:
            print("canny_edge_detection: Test failed, images are not similar enough.")
            sys.exit(1)
        else:
            print("canny_edge_detection: Test passed, images are similar.")
            sys.exit(0)
    except Exception as e:
        print("canny_edge_detection: Error ({})".format(e))
        sys.exit(1)

if __name__ == "__main__":
    main()