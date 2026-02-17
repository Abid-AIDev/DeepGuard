import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// Fade-in animation for sections
export const FadeIn = ({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

// Stagger children animation
export const StaggerContainer = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
            hidden: {},
            visible: {
                transition: {
                    staggerChildren: 0.1,
                },
            },
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const StaggerItem = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        }}
        className={className}
    >
        {children}
    </motion.div>
);

// Animated counter
export const AnimatedCounter = ({ value, className = "" }: { value: number; className?: string }) => (
    <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={className}
    >
        {value}
    </motion.span>
);

// Scale on hover
export const ScaleOnHover = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
    >
        {children}
    </motion.div>
);
