import { useEffect, useId, useRef } from "react";
import { snackPayload } from "@/lib/github-preview";

/** Runs an Expo / React Native repository in Expo Snack's web player. A POST form is used because the files are too large for a URL. */
export default function ExpoSnackRuntime({ files, name }: { files: Record<string, string>; name: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const frameName = "snack-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const payload = snackPayload(files);
  useEffect(() => { formRef.current?.submit(); }, []);
  return <div className="h-full min-h-[650px] w-full">
    <form ref={formRef} method="POST" action="https://snack.expo.dev/embedded" target={frameName} className="hidden">
      <input type="hidden" name="platform" value="web" />
      <input type="hidden" name="preview" value="true" />
      <input type="hidden" name="theme" value="light" />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="dependencies" value={payload.dependencies.join(",")} />
      <input type="hidden" name="files" value={JSON.stringify(payload.files)} />
    </form>
    <iframe name={frameName} title="Prévia do app Expo" className="h-full min-h-[650px] w-full border-0 bg-card" allow="geolocation; accelerometer; gyroscope; magnetometer" />
  </div>;
}
