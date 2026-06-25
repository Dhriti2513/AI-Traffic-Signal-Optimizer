# traffic_counter_final.py
import cv2
from ultralytics import YOLO
import csv

# Load video and YOLO model
cap = cv2.VideoCapture("traffic.mp4")
model = YOLO("yolov8n.pt")

# Line position
line_y = 950  # adjust based on your video resolution

# Classes we want to count (YOLOv8 COCO labels)
vehicle_classes = {
    2: "Car",
    3: "Motorbike",
    5: "Bus",
    7: "Truck"
}

# Counters
vehicle_count = 0
counted_ids = set()
per_class_counts = {name: 0 for name in vehicle_classes.values()}

# --- Setup Video Writer ---
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter("output_final.mp4", fourcc, cap.get(cv2.CAP_PROP_FPS),
                      (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                       int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

for result in model.track(source="traffic.mp4", stream=True, tracker="bytetrack.yaml"):
    frame = result.orig_img
    boxes = result.boxes

    for box in boxes:
        cls = int(box.cls[0])  # class ID
        if cls not in vehicle_classes:
            continue

        label = vehicle_classes[cls]
        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
        obj_id = int(box.id[0]) if box.id is not None else -1
        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)

        # Draw bounding box + ID + class label
        cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(frame, f"{label} ID {obj_id}", (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Crossing check
        if cy > line_y and obj_id not in counted_ids:
            vehicle_count += 1
            per_class_counts[label] += 1
            counted_ids.add(obj_id)

    # Draw line
    cv2.line(frame, (0, line_y), (frame.shape[1], line_y), (0, 0, 255), 2)

    # Show total + per-class counts
    cv2.putText(frame, f"Total: {vehicle_count}", (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    y_offset = 100
    for cls_name, count in per_class_counts.items():
        cv2.putText(frame, f"{cls_name}: {count}", (50, y_offset),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        y_offset += 40

    # Show live window
    cv2.imshow("Traffic Feed", frame)

    # Save frame to output video
    out.write(frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
out.release()

# --- Export per-class counts to CSV ---
with open("traffic_counts.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["Class", "Count"])
    for cls_name, count in per_class_counts.items():
        writer.writerow([cls_name, count])
    writer.writerow(["Total Vehicles", vehicle_count])

cv2.destroyAllWindows()
print("✅ Counts exported to traffic_counts.csv")

