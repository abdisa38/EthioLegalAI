import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Clock,
  FileText,
  Filter,
  MessageSquare,
  Search,
  Shield,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";

import ErrorState from "../../../shared/components/states/ErrorState";
import EmptyState from "../../../shared/components/states/EmptyState";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import ChatHistorySkeleton from "../components/ChatHistorySkeleton";
import {
  useChatHistory,
  useDeleteChat,
  useToggleStarChat,
} from "../hooks/useChatHistory";

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> =
  {
    "Tenant Rights": { color: "#10b981", icon: Shield },
    "Labor Law": { color: "#f59e0b", icon: TrendingUp },
    Contract: { color: "#6366f1", icon: FileText },
    General: { color: "#8b5cf6", icon: MessageSquare },
  };

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError, error, refetch } = useChatHistory();
  const toggleStarMutation = useToggleStarChat();
  const deleteChatMutation = useDeleteChat();

  const chats = data || [];
  const categories = ["All", "Tenant Rights", "Labor Law", "Contract", "General"];

  const filtered = useMemo(() => {
    return chats.filter((c: any) => {
      if (
        debouncedSearch &&
        !c.title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !c.question.toLowerCase().includes(debouncedSearch.toLowerCase())
      ) {
        return false;
      }
      if (filterCat !== "All" && c.category !== filterCat) return false;
      return true;
    });
  }, [chats, debouncedSearch, filterCat]);

  const starredChats = filtered.filter((c: any) => c.starred);
  const recentChats = filtered.filter((c: any) => !c.starred);

  const ChatCard = ({ chat }: { chat: any }) => {
    const cat = categoryConfig[chat.category] || {
      color: "#64748b",
      icon: MessageSquare,
    };
    const CatIcon = cat.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "18px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
        className="hover:border-white/10 transition-colors"
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${cat.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CatIcon size={18} color={cat.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#f1f5f9",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {chat.title}
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => toggleStarMutation.mutate(chat._id)}
                disabled={toggleStarMutation.isPending}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: chat.starred ? "#f59e0b" : "#475569",
                }}
              >
                <Star size={15} fill={chat.starred ? "#f59e0b" : "none"} />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this chat?")) {
                    deleteChatMutation.mutate(chat._id);
                  }
                }}
                disabled={deleteChatMutation.isPending}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#475569",
                }}
                className="hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.5,
              marginBottom: 10,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {chat.question}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 11,
                color: cat.color,
                background: `${cat.color}10`,
                padding: "2px 8px",
                borderRadius: 100,
              }}
            >
              {chat.category}
            </span>
            <span style={{ fontSize: 11, color: "#475569" }}>
              🌐 {chat.language}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#475569",
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Clock size={10} /> {new Date(chat.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate("/app/chat")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 8,
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#818cf8",
            cursor: "pointer",
            fontSize: 12,
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          New <ArrowRight size={12} />
        </button>
      </motion.div>
    );
  };

  if (isLoading) return <ChatHistorySkeleton />;

  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;

  if (!chats.length) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Start a new chat to ask your legal question."
        actionLabel="New chat"
        onAction={() => navigate("/app/chat")}
        icon={<MessageSquare className="size-6" />}
      />
    );
  }

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1000, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#f1f5f9",
                marginBottom: 6,
              }}
            >
              Chat History
            </h1>
            <p style={{ color: "#64748b", fontSize: 15 }}>
              {chats.length} saved conversations · {starredChats.length} starred
            </p>
          </div>
          <button
            onClick={() => navigate("/app/chat")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <MessageSquare size={14} /> New Chat
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ marginBottom: 28 }}
      >
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Search
            size={16}
            color="#475569"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              padding: "11px 14px 11px 42px",
              color: "#f1f5f9",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
            className="focus:border-indigo-500/40 transition-colors"
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Filter size={13} color="#475569" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              style={{
                padding: "5px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
                background:
                  filterCat === cat
                    ? "rgba(99,102,241,0.2)"
                    : "rgba(255,255,255,0.04)",
                color: filterCat === cat ? "#818cf8" : "#64748b",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No conversations found"
          description="Try a different search or start a new chat."
          actionLabel="New chat"
          onAction={() => navigate("/app/chat")}
          icon={<MessageSquare className="size-6" />}
        />
      ) : (
        <>
          {starredChats.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>
                  Starred
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {starredChats.map((chat: any) => (
                  <ChatCard key={chat._id} chat={chat} />
                ))}
              </div>
            </div>
          )}

          {recentChats.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <Clock size={14} color="#64748b" />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>
                  Recent
                </h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentChats.map((chat: any) => (
                  <ChatCard key={chat._id} chat={chat} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

