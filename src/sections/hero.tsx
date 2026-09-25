"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { FiMail } from "react-icons/fi";
import { FaGithub, FaWhatsapp } from "react-icons/fa";

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 120,
    damping: 20,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 120,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="h-screen min-h-screen snap-start flex items-center justify-center relative overflow-hidden bg-[#09090B]"
    >
      {/* Background Base */}
      <div className="absolute inset-0 bg-[#09090B]" />

      {/* Portrait Layer */}
      <motion.div
        animate={{ scale: [1.08, 1.1, 1.08] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 overflow-hidden"
      />
      <div className="absolute -right-[3%] top-[5%] h-[100%] w-[50%]">
        <Image
          src="/me.png"
          alt="Pankaj Badhan"
          fill
          priority
          className="object-contain opacity-60 blur-[1px] scale-110"
        />
      </div>

      {/* Main Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent" />

      {/* Extra Fade From Bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-transparent" />

      {/* Blue Glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full bg-blue-500/15 blur-[180px]" />

      {/* Purple Glow */}
      <div className="absolute bottom-[-250px] left-[-150px] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[180px]" />

      <motion.div
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 h-full w-[250px] bg-gradient-to-r from-transparent via-blue-500/5 to-transparent blur-xl pointer-events-none"
      />

      <motion.div
        style={{
          background: `radial-gradient(300px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(255,255,255,0.12), transparent 70%)`,
        }}
        className="absolute inset-0"
      />

      <motion.div
        style={{
          left: smoothX,
          top: smoothY,
        }}
        className="absolute w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none bg-cyan-400/10 blur-[140px]"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-blue-400 tracking-[0.4em] text-xs md:text-sm font-medium"
        >
          STUDENT • BUILDER • EXPLORER
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-white text-6xl md:text-8xl lg:text-[8rem] font-bold leading-[0.9] tracking-tight drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]"
        >
          Pankaj
          <br />
          Badhan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-2xl text-zinc-400 text-lg md:text-xl leading-relaxed"
        >
          Addicted to Actioning Ideas
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-5"
        >
          <a
            href="mailto:pankajbadhann@gmail.com"
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:scale-110 hover:-translate-y-1 text-zinc-300 hover:text-white hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300"
          >
            <FiMail size={24} />
          </a>

          <a
            href="https://github.com/pankajbadhann"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:scale-110 hover:-translate-y-1 text-zinc-300 hover:text-white hover:border-blue-500/40 hover:bg-white/10 transition-all duration-300"
          >
            <FaGithub size={24} />
          </a>

          <a
            href="https://wa.me/917837618700"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:scale-110 hover:-translate-y-1 text-zinc-300 hover:text-white hover:border-green-500/40 hover:bg-white/10 transition-all duration-300"
          >
            <FaWhatsapp size={24} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}