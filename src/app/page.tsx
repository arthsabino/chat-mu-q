import Link from "next/link";
import Button from "./components/Button";

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-1 text-6xl font-extrabold text-blue-500">Chat Mu Q</h1>
      <p className="mb-10">Chat na tayo idols!</p>
      <Button as={Link} href="/chat">
        Start Chatting!
      </Button>
    </div>
  );
}
