import { Notifications, AccountCircle } from "@mui/icons-material";

const Navbar = () => {
return (
    <div
    style={{
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        boxShadow: "0 2px #719430",
        marginLeft: "260px",
    }}
    >
    <h3>Dashboard</h3>

    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Notifications />
        <AccountCircle />
    </div>
    </div>
);
};

export default Navbar;
