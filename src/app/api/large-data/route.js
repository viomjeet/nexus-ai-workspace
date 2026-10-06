export async function GET() {
  const firstNames = [
    "Aarav", "Aditi", "Amit", "Ananya", "Deepak", "Divya", "Gaurav", "Ishaan",
    "Kavya", "Manish", "Neha", "Nikhil", "Pooja", "Prateek", "Priya", "Rahul",
    "Rohan", "Sanjay", "Sneha", "Vikas", "Vikram", "Sunita", "Rajesh", "Karan"
  ];

  const lastNames = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Mishra", "Patel", "Jha",
    "Yadav", "Tiwari", "Das", "Reddy", "Mehta", "Chopra", "Bansal", "Saxena"
  ];

  const domains = ["gmail.com", "outlook.com", "company.io", "techcorp.com", "enterprise.in"];
  const roles = ["Admin", "Member", "Editor", "Viewer", "Manager"];
  const departments = ["Engineering", "Product", "Operations", "Finance", "Human Resources"];

  const users = Array.from({ length: 100000 }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 7) % lastNames.length];
    const domain = domains[(index * 3) % domains.length];
    const role = roles[index % roles.length];
    const department = departments[index % departments.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@${domain}`;
    return {
      id: index + 1,
      name: `${firstName} ${lastName}`,
      email,
      role,
      department,
      status: index % 7 === 0 ? "Inactive" : "Active",
      createdAt: new Date(Date.now() - (index * 3600000)).toISOString().split("T")[0],
    };
  });
  return Response.json(users);
}