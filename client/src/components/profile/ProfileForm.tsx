"use client";

import { Controller, useForm } from "react-hook-form";

import { FrontPatchUserSchema, Sports, Units, type User } from "@couloir/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { useApi } from "@/app/hooks/useApi";
import { patchUser } from "@/lib/dataClient";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((m) => m.AddressAutofill),
  { ssr: false },
);

export default function ProfileForm({ user }: { user: User }) {
  const apiFetch = useApi();
  const router = useRouter();

  type FormValues = z.input<typeof FrontPatchUserSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(FrontPatchUserSchema),
    mode: "onChange",
    defaultValues: {
      username: user.username ?? "",
      isPublic: user.isPublic ?? false,
      bio: user.bio ?? "",
      units: user.units ?? "km",
      sports: user.sports ?? [],
      website: user.website ?? "",
      weeklyDistance: user.weeklyDistance ?? 0,
      birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
      address: user.address ?? {},
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await patchUser(apiFetch, { ...data });
      toast.success("Profile updated");
      if (user.username !== data.username) {
        router.push(`/u/${data.username}/edit`);
      } else {
        router.refresh();
      }
    } catch (error) {
      form.setError("username", {
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <form
      id="profile-form-edit"
      onSubmit={form.handleSubmit(onSubmit, (errors) => {
        console.log("Validation errors:", errors);
      })}
      noValidate
      className="flex flex-col gap-4 w-full max-w-sm"
    >
      <Controller
        name="username"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="username">
              Username<span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              {...field}
              required
              id="username"
              placeholder="Username"
              value={field.value}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="isPublic"
        control={form.control}
        render={({ field }) => (
          <label className="flex items-center gap-2">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
            Public Profile
          </label>
        )}
      />

      <Controller
        name="units"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="units">Units</FieldLabel>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger aria-invalid={fieldState.invalid} id="units">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                {Units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="sports"
        control={form.control}
        render={({ field }) => (
          <>
            {Sports.map((sport) => (
              <label key={sport} className="flex items-center gap-2">
                <Checkbox
                  checked={field.value?.includes(sport)}
                  onCheckedChange={(checked) => {
                    const current = field.value ?? [];
                    if (checked) {
                      field.onChange([...current, sport]);
                    } else {
                      field.onChange(current.filter((v) => v !== sport));
                    }
                  }}
                />
                {sport}
              </label>
            ))}
          </>
        )}
      />

      <Controller
        name="birthDate"
        control={form.control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {field.value
                  ? format(field.value as Date, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Calendar
                mode="single"
                selected={field.value as Date | undefined}
                onSelect={field.onChange}
                captionLayout="dropdown"
                disabled={(date) =>
                  date > new Date() || date < new Date("1920-01-01")
                }
              />
            </PopoverContent>
          </Popover>
        )}
      />

      <Controller
        name="website"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input
              {...field}
              id="website"
              type="url"
              placeholder="Website"
              value={field.value}
              aria-invalid={fieldState.invalid}
              onInvalid={(e) => e.preventDefault()}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="bio"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <Textarea
              {...field}
              id="bio"
              placeholder="Bio"
              value={field.value}
              aria-invalid={fieldState.invalid}
              onInvalid={(e) => e.preventDefault()}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="weeklyDistance"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="weeklyDistance">Weekly Distance</FieldLabel>
            <Input
              {...field}
              id="weeklyDistance"
              type="number"
              placeholder="Weekly Distance"
              value={field.value}
              onChange={(e) =>
                field.onChange(
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              aria-invalid={fieldState.invalid}
              onInvalid={(e) => e.preventDefault()}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Field>
        <FieldLabel htmlFor="address">Address</FieldLabel>
        <AddressAutofill
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
          onRetrieve={(res) => {
            const f = res.features[0];
            form.setValue("address", {
              formatted: f.properties.full_address ?? "",
              street: f.properties.address_line1 ?? "",
              city: f.properties.place_name ?? "",
              postalCode: f.properties.postcode ?? "",
              country: f.properties.country ?? "",
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
            });
          }}
        >
          <Input
            id="address"
            autoComplete="address-line1"
            defaultValue={user.address?.formatted ?? ""}
            placeholder="Address"
          />
        </AddressAutofill>
      </Field>

      <Field orientation="horizontal">
        <Button
          className="cursor-pointer"
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="profile-form-edit"
          disabled={form.formState.isSubmitting}
          className="cursor-pointer"
        >
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </Field>
    </form>
  );
}
