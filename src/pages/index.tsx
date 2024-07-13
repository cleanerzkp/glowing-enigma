import { VerificationLevel, IDKitWidget } from "@worldcoin/idkit";
import type { ISuccessResult } from "@worldcoin/idkit";
import type { VerifyReply } from "./api/verify";

export default function Home() {
  if (!process.env.NEXT_PUBLIC_WLD_APP_ID) {
    throw new Error("app_id is not set in environment variables!");
  }
  if (!process.env.NEXT_PUBLIC_WLD_ACTION) {
    throw new Error("action is not set in environment variables!");
  }

  const onSuccess = () => {
    window.location.href = "/success";
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit:\n", JSON.stringify(result)); 
    const reqBody = {
      merkle_root: result.merkle_root,
      nullifier_hash: result.nullifier_hash,
      proof: result.proof,
      verification_level: result.verification_level,
      action: process.env.NEXT_PUBLIC_WLD_ACTION,
      signal: "",
    };
    console.log("Sending proof to backend for verification:\n", JSON.stringify(reqBody));
    const res: Response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });
    const data: VerifyReply = await res.json();
    if (res.status == 200) {
      console.log("Successful response from backend:\n", data); 
    } else {
      throw new Error(`Error code ${res.status} (${data.code}): ${data.detail}` ?? "Unknown error.");
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center align-middle h-screen">
        <p className="text-2xl mb-5">World ID Cloud Template</p>
        <IDKitWidget
          action={process.env.NEXT_PUBLIC_WLD_ACTION!}
          app_id={process.env.NEXT_PUBLIC_WLD_APP_ID as `app_${string}`}
          onSuccess={onSuccess}
          handleVerify={handleProof}
          verification_level={VerificationLevel.Orb}
        >
          {({ open }) => (
            <button className="border border-black rounded-md" onClick={open}>
              <div className="mx-3 my-1">Verify with World ID</div>
            </button>
          )}
        </IDKitWidget>
      </div>
    </div>
  );
}