-- Update the handle_new_user function to handle social login profile sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- For social login, don't overwrite existing profile data
    -- Only update if the fields are null in profiles table
    UPDATE public.profiles
    SET 
      email = COALESCE(email, NEW.email),
      full_name = CASE 
        WHEN full_name IS NULL OR full_name = '' 
        THEN COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
        ELSE full_name
      END,
      avatar_url = CASE 
        WHEN avatar_url IS NULL OR avatar_url = '' 
        THEN NEW.raw_user_meta_data->>'avatar_url'
        ELSE avatar_url
      END,
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- Create new profile for new users
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.raw_user_meta_data->>'avatar_url'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the trigger (in case it already exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also handle updates to preserve custom profile data
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update profile if it exists and we're not overwriting custom data
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Don't update profile data from auth metadata if user has custom profile
    -- This prevents social login from overwriting user's custom profile
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();