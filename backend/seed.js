import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");

    await User.deleteMany({});
    console.log("🗑️ Usuários anteriores removidos");

    const hashedPassword = await bcrypt.hash("mude1234", 10);

    const usuarios = [
      {
        name: "Admin User",
        email: "admin@empresa.com",
        password: hashedPassword,
        phone: "11999999999",
        role: "ADMIN",
        cpf: "12345678900",
        address: "Rua Admin, 123",
        pixKey: "admin@pix",
        profilePic: "https://via.placeholder.com/150",
      },
      {
        name: "Líder User",
        email: "lider@empresa.com",
        password: hashedPassword,
        phone: "11988888888",
        role: "LEADER",
        cpf: "12345678901",
        address: "Rua Líder, 456",
        pixKey: "lider@pix",
        profilePic: "https://via.placeholder.com/150",
      },
      {
        name: "João Worker",
        email: "joao@worker.com",
        password: hashedPassword,
        phone: "11977777777",
        role: "INTERMITTENT",
        cpf: "12345678902",
        address: "Rua Worker, 789",
        pixKey: "joao@pix",
        profilePic: "https://via.placeholder.com/150",
      },
    ];

    const inserted = await User.insertMany(usuarios);
    console.log(`✅ ${inserted.length} usuários criados!`);

    console.log("\n📧 Contas de teste:");
    console.log("1. admin@empresa.com / mude1234 (ADMIN)");
    console.log("2. lider@empresa.com / mude1234 (LÍDER)");
    console.log("3. joao@worker.com / mude1234 (INTERMITENTE)");

    await mongoose.connection.close();
    console.log("\n✅ Concluído!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  }
}

seed();
