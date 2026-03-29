const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profileId = process.argv[2];
  if (!profileId) {
    console.error("Please provide a profile ID");
    return;
  }

  try {
    const profile = await prisma.employeeProfile.findFirst({
      where: { OR: [{ id: profileId }, { userId: profileId }] },
      include: { user: true }
    });

    if (!profile) {
      console.log("No profile found for ID:", profileId);
      return;
    }

    console.log("Found profile:", profile.fullName, "User ID:", profile.userId);
    
    // Delete the user
    await prisma.user.delete({
      where: { id: profile.userId }
    });
    
    console.log("SUCCESS: User and cascaded records deleted.");
  } catch (err) {
    console.error("ERROR during deletion:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
