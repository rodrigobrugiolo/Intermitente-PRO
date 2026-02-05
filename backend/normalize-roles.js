import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: String,
  cpf: String,
  address: String,
  pixKey: String,
  profilePic: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

async function normalizeRoles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    // Normalizar roles para maiúsculas
    const roles = {
      admin: "ADMIN",
      leader: "LEADER",
      intermittent: "INTERMITTENT",
      ADMIN: "ADMIN",
      LEADER: "LEADER",
      INTERMITTENT: "INTERMITTENT",
    };

    for (const [oldRole, newRole] of Object.entries(roles)) {
      const result = await User.updateMany(
        { role: oldRole },
        { role: newRole },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `✅ Atualizados ${result.modifiedCount} usuários de ${oldRole} para ${newRole}`,
        );
      }
    }

    console.log("\n📧 Verificando usuários após normalização:");
    const users = await User.find({}, "name email role").exec();
    users.forEach((u) => {
      console.log(`- ${u.name} (${u.email}): ${u.role}`);
    });

    console.log("\n✅ Normalização concluída!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

normalizeRoles();
