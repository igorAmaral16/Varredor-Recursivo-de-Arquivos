type Props = {
    status: "idle" | "editing" | "searching" | "searched" | "copying" | "done" | "error";
    message: string;
};

export function StatusBar({ status, message }: Props) {
    return (
        <div style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12,
            background: "#fafafa"
        }}>
            <div style={{ fontWeight: 700 }}>Status: {status}</div>
            <div>{message}</div>
        </div>
    );
}
