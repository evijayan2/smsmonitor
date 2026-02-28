import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  User
} from "lucide-react";
import Image from "next/image";
import MessageBrowser from "@/components/MessageBrowser";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { decrypt } from "@/lib/encryption";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const rawMessages = await prisma.smsMessage.findMany({
    orderBy: {
      receivedAt: "desc",
    },
    take: 100, // Increased limit for better browsing
  });

  // Decrypt sensitive fields
  const messages = rawMessages.map(msg => ({
    ...msg,
    sender: decrypt(msg.sender),
    content: decrypt(msg.content),
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="SMS Monitor Logo"
              className="w-9 h-9 rounded-xl"
            />
            <span className="text-xl font-bold text-foreground">
              SMS Monitor
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 sm:pl-4 sm:border-l border-border">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="User"
                    fill
                    sizes="32px"
                  />
                ) : (
                  <User className="w-full h-full p-1.5 text-muted-foreground" />
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium text-foreground leading-none">
                  {session.user?.name}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {session.user?.email}
                </span>
              </div>
            </div>
            <div className="flex items-center pl-4 border-l border-border space-x-4">
              <ThemeToggle />
              <div className="w-px h-8 bg-border" />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-7xl mx-auto px-4 py-8 w-full overflow-hidden">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Monitoring Dashboard</h2>
            <p className="text-muted-foreground text-sm">Real-time SMS ingestion logs from authorized devices</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Service Online</span>
          </div>
        </div>

        <MessageBrowser initialMessages={messages as any} />
      </main>
    </div>
  );
}
