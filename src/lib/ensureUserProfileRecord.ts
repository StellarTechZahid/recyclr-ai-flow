import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

const getProfileName = (user: User) => {
  const metadataName = typeof user.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name.trim()
    : "";

  if (metadataName) return metadataName;

  const emailPrefix = user.email?.split("@")[0]?.trim();
  return emailPrefix || null;
};

export const ensureUserProfileRecord = async (user: User) => {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: getProfileName(user),
      },
      {
        onConflict: "id",
        ignoreDuplicates: true,
      }
    );

  if (error) {
    throw error;
  }
};