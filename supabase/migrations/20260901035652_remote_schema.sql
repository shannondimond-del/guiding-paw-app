CREATE TABLE "public"."calendar_events" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"   uuid                     NOT NULL,
  "title"      text                     NOT NULL,
  "event_date" date                     NOT NULL,
  "event_time" text,
  "event_type" text                     DEFAULT 'other'::text,
  "created_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "calendar_events_event_type_check" CHECK ((event_type = ANY (ARRAY['training'::text, 'vet'::text, 'other'::text]))),
  CONSTRAINT "calendar_events_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."calendar_events"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."lesson_progress" (
  "id"                    uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "pet_id"                uuid                     NOT NULL,
  "program"               text                     NOT NULL,
  "week_number"           text                     NOT NULL,
  "lesson_key"            text                     NOT NULL,
  "completed"             boolean                  DEFAULT false,
  "week_completed_at"     timestamp with time zone,
  "welcome_video_watched" boolean                  DEFAULT false,
  CONSTRAINT "lesson_progress_pet_id_program_week_number_lesson_key_key" UNIQUE (pet_id, program, week_number, lesson_key),
  CONSTRAINT "lesson_progress_pkey" PRIMARY KEY (id),
  CONSTRAINT "lesson_progress_program_check" CHECK ((program = ANY (ARRAY['puppy'::text, 'standard'::text])))
);

ALTER TABLE "public"."lesson_progress"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."pet_documents" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "pet_id"        uuid                     NOT NULL,
  "file_name"     text,
  "document_type" text,
  "file_url"      text,
  "uploaded_at"   timestamp with time zone DEFAULT now(),
  CONSTRAINT "pet_documents_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."pet_documents"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."pets" (
  "id"                      uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "owner_id"                uuid                     NOT NULL,
  "name"                    text                     NOT NULL,
  "breed"                   text,
  "birthday"                date,
  "gender"                  text,
  "weight"                  text,
  "pet_type"                text                     DEFAULT 'dog'::text,
  "food"                    text,
  "allergies_sensitivities" text,
  "medications"             text,
  "grooming_notes"          text,
  "potty_notes"             text,
  "photo_url"               text,
  "created_at"              timestamp with time zone DEFAULT now(),
  CONSTRAINT "pets_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."pets"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."program_enrollment" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "pet_id"       uuid                     NOT NULL,
  "program"      text                     NOT NULL,
  "purchased_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "program_enrollment_pet_id_program_key" UNIQUE (pet_id, program),
  CONSTRAINT "program_enrollment_pkey" PRIMARY KEY (id),
  CONSTRAINT "program_enrollment_program_check" CHECK ((program = ANY (ARRAY['puppy'::text, 'standard'::text])))
);

ALTER TABLE "public"."program_enrollment"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."streaks" (
  "id"                 uuid    NOT NULL DEFAULT gen_random_uuid(),
  "pet_id"             uuid    NOT NULL,
  "current_streak"     integer DEFAULT 0,
  "last_activity_date" date,
  CONSTRAINT "streaks_pet_id_key" UNIQUE (pet_id),
  CONSTRAINT "streaks_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."streaks"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "id"                       uuid                     NOT NULL,
  "first_name"               text,
  "last_name"                text,
  "email"                    text,
  "phone"                    text,
  "country_code"             text,
  "role"                     text[],
  "training_goals"           text[],
  "preferred_training_time"  text[],
  "plan"                     text,
  "subscription_status"      text                     DEFAULT 'active'::text,
  "card_last4"               text,
  "renewal_date"             date,
  "created_at"               timestamp with time zone DEFAULT now(),
  "active_device_id"         text,
  "active_device_claimed_at" timestamp with time zone,
  "status"                   text,
  "deletion_requested_at"    timestamp with time zone,
  "active_pet_id"            uuid,
  CONSTRAINT "users_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."lesson_progress"
  ADD CONSTRAINT "lesson_progress_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE "public"."pet_documents"
  ADD CONSTRAINT "pet_documents_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE "public"."program_enrollment"
  ADD CONSTRAINT "program_enrollment_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE "public"."streaks"
  ADD CONSTRAINT "streaks_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public.pets(id) ON DELETE CASCADE;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_active_pet_id_fkey" FOREIGN KEY (active_pet_id) REFERENCES public.pets(id) ON DELETE SET NULL;

ALTER TABLE "public"."users"
  ADD CONSTRAINT "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."calendar_events"
  ADD CONSTRAINT "calendar_events_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."pets"
  ADD CONSTRAINT "pets_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX idx_calendar_events_date ON public.calendar_events USING btree (event_date);

CREATE INDEX idx_calendar_events_owner_id ON public.calendar_events USING btree (owner_id);

CREATE INDEX idx_lesson_progress_pet_id ON public.lesson_progress USING btree (pet_id);

CREATE INDEX idx_pet_documents_pet_id ON public.pet_documents USING btree (pet_id);

CREATE INDEX idx_pets_owner_id ON public.pets USING btree (owner_id);

CREATE INDEX idx_program_enrollment_pet_id ON public.program_enrollment USING btree (pet_id);

CREATE POLICY "Users can manage own calendar events" ON "public"."calendar_events"
  FOR ALL
  TO PUBLIC
  USING ((auth.uid() = owner_id));

CREATE POLICY "Users can view own calendar events" ON "public"."calendar_events"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = owner_id));

CREATE POLICY "Users can manage own lesson progress" ON "public"."lesson_progress"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = lesson_progress.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can view own lesson progress" ON "public"."lesson_progress"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = lesson_progress.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can manage own pet documents" ON "public"."pet_documents"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = pet_documents.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can view own pet documents" ON "public"."pet_documents"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = pet_documents.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can delete own pets" ON "public"."pets"
  FOR DELETE
  TO PUBLIC
  USING ((auth.uid() = owner_id));

CREATE POLICY "Users can insert own pets" ON "public"."pets"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = owner_id));

CREATE POLICY "Users can update own pets" ON "public"."pets"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = owner_id));

CREATE POLICY "Users can view own pets" ON "public"."pets"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = owner_id));

CREATE POLICY "Users can manage own program enrollment" ON "public"."program_enrollment"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = program_enrollment.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can view own program enrollment" ON "public"."program_enrollment"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = program_enrollment.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can manage own streaks" ON "public"."streaks"
  FOR ALL
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = streaks.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can view own streaks" ON "public"."streaks"
  FOR SELECT
  TO PUBLIC
  USING ((EXISTS ( SELECT 1
   FROM public.pets
  WHERE ((pets.id = streaks.pet_id) AND (pets.owner_id = auth.uid())))));

CREATE POLICY "Users can insert own profile" ON "public"."users"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update own profile" ON "public"."users"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Users can view own profile" ON "public"."users"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Give users access to own folder vumbu_0" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (((bucket_id = 'pet-documents'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Give users access to own folder vumbu_1" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'pet-documents'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Give users access to own folder vumbu_2" ON "storage"."objects"
  FOR UPDATE
  TO PUBLIC
  USING (((bucket_id = 'pet-documents'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Give users access to own folder vumbu_3" ON "storage"."objects"
  FOR DELETE
  TO PUBLIC
  USING (((bucket_id = 'pet-documents'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Users can delete own pet documents from storage" ON "storage"."objects"
  FOR DELETE
  TO PUBLIC
  USING (((bucket_id = 'pet-documents'::text) AND (EXISTS ( SELECT 1
   FROM public.pets
  WHERE (((pets.id)::text = (storage.foldername(pets.name))[1]) AND (pets.owner_id = auth.uid()))))));

CREATE POLICY "Users can upload own pet documents to storage" ON "storage"."objects"
  FOR INSERT
  TO PUBLIC
  WITH CHECK (((bucket_id = 'pet-documents'::text) AND (EXISTS ( SELECT 1
   FROM public.pets
  WHERE (((pets.id)::text = (storage.foldername(pets.name))[1]) AND (pets.owner_id = auth.uid()))))));

CREATE POLICY "Users can view own pet documents in storage" ON "storage"."objects"
  FOR SELECT
  TO PUBLIC
  USING (((bucket_id = 'pet-documents'::text) AND (EXISTS ( SELECT 1
   FROM public.pets
  WHERE (((pets.id)::text = (storage.foldername(pets.name))[1]) AND (pets.owner_id = auth.uid()))))));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."calendar_events" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."lesson_progress" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."pet_documents" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."pets" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."program_enrollment" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."streaks" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated", "postgres", "service_role";

