import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";

export default function ActivityImages({ activity }: { activity: Activity }) {
  return (
    <>
      {activity.images && activity.images.length > 0 && (
        <div className="mt-5 ">
          <Carousel>
            <CarouselContent className="py-5 backdrop:blur-sm rounded-lg">
              {activity.images.map((image) => (
                // same size for every image to avoid layout shift, the actual image will be resized with object-fit: cover
                <CarouselItem
                  key={image.id}
                  className="md:basis-1/2 lg:basis-1/3 "
                >
                  <img
                    src={ROUTES.api.imagePath(image.immichId, "thumbnail")}
                    height={100}
                    alt={`Image ${image.id}`}
                    className="w-full h-full object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
        </div>
      )}
    </>
  );
}
