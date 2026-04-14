import { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";

export default function ActivityImages({ activity }: { activity: Activity }) {
  return (
    <>
      {activity.images && activity.images.length > 0 && (
        <div>
          <h2>Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activity.images.map((image) => (
              <img
                key={image.id}
                src={ROUTES.api.imagePath(image.immichId, "thumbnail")}
                alt={`Image ${image.id}`}
                className="w-full h-auto"
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
