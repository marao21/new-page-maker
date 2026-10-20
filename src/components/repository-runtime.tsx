import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";

export default function RepositoryRuntime({ files }: { files: Record<string, string> }) {
  return <SandpackProvider files={files} customSetup={{ environment: "node" }} options={{ autorun: true }}>
    <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton style={{ height: "100%", minHeight: 650 }} />
  </SandpackProvider>;
}