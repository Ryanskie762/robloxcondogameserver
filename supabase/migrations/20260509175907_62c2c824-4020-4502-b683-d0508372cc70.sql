CREATE TABLE public.private_server_avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.private_server_avatars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view avatars" ON public.private_server_avatars
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert avatars" ON public.private_server_avatars
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update avatars" ON public.private_server_avatars
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete avatars" ON public.private_server_avatars
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER touch_private_server_avatars
  BEFORE UPDATE ON public.private_server_avatars
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.private_server_avatars (label, sort_order) VALUES
  ('A',1),('B',2),('C',3),('D',4),('E',5),('F',6),('G',7);