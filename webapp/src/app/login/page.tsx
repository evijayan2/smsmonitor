"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const getErrorMessage = (err: string) => {
        switch (err) {
            case "AccessDenied":
                return "Your email is not on the authorized list. Please contact the administrator.";
            case "Callback":
                return "Authentication was rejected. Please ensure you are using an authorized email.";
            default:
                return "An error occurred during sign-in. Please try again.";
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md p-10 space-y-8 bg-card/50 backdrop-blur-xl rounded-3xl border border-border shadow-2xl relative z-10"
            >
                <div className="text-center space-y-2">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="flex items-center justify-center w-16 h-16 mx-auto mb-6"
                    >
                        <img src="/logo.svg" alt="SMS Monitor" className="w-16 h-16 rounded-2xl" />
                    </motion.div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        SMS Monitor
                    </h1>
                    <p className="text-muted-foreground">
                        Securely access your message logs
                    </p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start space-x-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-200/80">
                                {getErrorMessage(error)}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pt-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => signIn("google", { callbackUrl: "/" })}
                        className="group relative flex items-center justify-center w-full px-6 py-4 space-x-3 text-lg font-semibold text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20"
                    >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.16-1.78 4.04-1.12 1.12-2.84 2.32-5.72 2.32-4.48 0-8.08-3.64-8.08-8.12s3.6-8.12 8.08-8.12c2.4 0 4.16.92 5.48 2.2l2.32-2.32C18.96 2.48 16.32 1.04 12.48 1.04 6.24 1.04 1.12 6.16 1.12 12.4s5.12 11.36 11.36 11.36c3.36 0 5.92-1.12 7.92-3.2 2-2 2.68-4.84 2.68-7.16 0-.68-.04-1.32-.16-1.92h-10.44z" />
                        </svg>
                        <span>Continue with Google</span>
                    </motion.button>
                </div>

                <div className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Protected by enterprise-grade encryption
                    </p>
                </div>
            </motion.div>

            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    );
}
