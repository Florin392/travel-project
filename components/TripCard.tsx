import { Link, useLocation } from "react-router";
import {
  ChipDirective,
  ChipListComponent,
  ChipsDirective,
} from "@syncfusion/ej2-react-buttons";
import { cn, getFirstWord } from "~/lib/utils";

const TripCard = ({
  id,
  name,
  location,
  imageUrl,
  tags,
  price,
}: TripCardProps) => {
  const path = useLocation();
  return (
    <Link
      to={
        path.pathname === "/" || path.pathname.startsWith("/travel")
          ? `/travel/${id}`
          : `/trips/${id}`
      }
      className="flex flex-col h-full shadow-300 bg-white rounded-[20px] relative"
    >
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-[160px] rounded-t-xl object-cover"
      />

      <article className="flex flex-col gap-3 mt-4 pl-[18px] pr-3.5">
        <h2 className="text-sm md:text-lg font-semibold text-dark-100 line-clamp-2">
          {name}
        </h2>
        <figure className="flex items-center gap-2">
          <img
            src="/assets/icons/location-mark.svg"
            alt="location"
            className="size-4"
          />
          <figcaption className="text-xs md:text-sm font-normal text-gray-100 truncate">
            {location}
          </figcaption>
        </figure>
      </article>

      <div className="mt-auto pl-[18px] pr-3.5 py-3">
        <ChipListComponent id="travel-chip">
          <ChipsDirective>
            {tags
              ?.filter((tag) => tag && tag.trim() !== "")
              .map((tag, index) => (
                <ChipDirective
                  key={index}
                  text={getFirstWord(tag)}
                  cssClass={cn(
                    index === 1
                      ? "!bg-pink-50 !text-pink-500"
                      : "!bg-success-50 !text-success-700"
                  )}
                />
              ))}
          </ChipsDirective>
        </ChipListComponent>
      </div>

      <article className="tripCard-pill">{price}</article>
    </Link>
  );
};

export default TripCard;
