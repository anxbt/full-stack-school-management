import { Day, PrismaClient, UserSex } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ---------------
  // SUPER ADMIN(S)
  // ---------------
  console.log("Creating Super Admin...");
  const superAdmin = await prisma.superAdmin.create({
    data: {
      id: "super-admin-1",
      username: "superadmin",
      email: "superadmin@schoolplatform.com",
      img: "https://i.pravatar.cc/300?img=68",
    },
  });

  // ---------------
  // SCHOOLS
  // ---------------
  console.log("Creating Schools...");
  const schools = [];
  const schoolNames = [
    "Greenwood High School",
    "Valley Elementary",
    "Riverside Academy",
    "Mountain View School",
    "Digital Tech Institute"
  ];

  for (let i = 0; i < schoolNames.length; i++) {
    const school = await prisma.school.create({
      data: {
        id: `school-${i + 1}`,
        name: schoolNames[i],
        code: schoolNames[i].replace(/\s+/g, "_").toUpperCase(),
        address: `${i + 100} Education Blvd, City ${i + 1}`,
        phone: `555-${100 + i}-${1000 + i}`,
        email: `info@${schoolNames[i].toLowerCase().replace(/\s+/g, "")}.edu`,
        domain: `${schoolNames[i].toLowerCase().replace(/\s+/g, "")}.edu`,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(schoolNames[i])}&background=random`,
        isActive: true,
        lastLogin: i < 3 ? new Date() : i === 3 ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : null,
        // Connect the super admin to all schools
        superAdmins: {
          connect: {
            id: superAdmin.id
          }
        }
      },
    });
    schools.push(school);
  }

  // For each school, create all necessary data
  for (const school of schools) {
    console.log(`Creating data for ${school.name}...`);
    await seedSchool(school.id);
  }

  console.log("Seeding completed successfully.");
}

async function seedSchool(schoolId: string) {
  // ---------------
  // ADMIN(S)
  // ---------------
  console.log("  Creating Admins...");
  await prisma.admin.create({
    data: {
      id: `admin-${schoolId}-1`,
      username: `admin_${schoolId}`,
      img: "https://i.pravatar.cc/300?img=52",
      schoolId: schoolId,
    },
  });

  // ---------------
  // GRADES
  // ---------------
  console.log("  Creating Grades...");
  const grades = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({
      data: {
        level: i,
        schoolId: schoolId,
      },
    });
    grades.push(grade);
  }

  // ---------------
  // SUBJECTS
  // ---------------
  console.log("  Creating Subjects...");
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  const subjects = [];
  for (const subject of subjectData) {
    const newSubject = await prisma.subject.create({
      data: {
        name: subject.name,
        schoolId: schoolId,
      },
    });
    subjects.push(newSubject);
  }

  // ---------------
  // TEACHERS
  // ---------------
  console.log("  Creating Teachers...");
  const teachers = [];
  for (let i = 1; i <= 15; i++) {
    const teacherId = `teacher-${schoolId}-${i}`;
    const teacher = await prisma.teacher.create({
      data: {
        id: teacherId,
        username: `teacher${i}_${schoolId}`,
        name: `Teacher ${i}`,
        surname: `Lastname ${i}`,
        email: `teacher${i}@${schoolId}.edu`,
        phone: `123-456-${7890 + i}`,
        address: `${i} Faculty Avenue, Teacher Town`,
        bloodType: ["A+", "B+", "O+", "AB+"][i % 4],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30 - (i % 10))),
        schoolId: schoolId,
        // Connect each teacher to 1-3 subjects
        subjects: {
          connect: Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            () => ({ id: subjects[Math.floor(Math.random() * subjects.length)].id })
          ),
        },
      },
    });
    teachers.push(teacher);
  }

  // ---------------
  // CLASSES
  // ---------------
  console.log("  Creating Classes...");
  const classes = [];
  const classSections = ["A", "B", "C"];
  
  for (let g = 0; g < grades.length; g++) {
    const grade = grades[g];
    for (let s = 0; s < 2; s++) { // Create 2 sections per grade
      const className = `${grade.level}${classSections[s]}`;
      const supervisorIndex = (g * 2 + s) % teachers.length;
      
      const classItem = await prisma.class.create({
        data: {
          name: className,
          capacity: 25 + Math.floor(Math.random() * 10),
          gradeId: grade.id,
          schoolId: schoolId,
          supervisorId: teachers[supervisorIndex].id,
        },
      });
      classes.push(classItem);
    }
  }

  // ---------------
  // PARENTS
  // ---------------
  console.log("  Creating Parents...");
  const parents = [];
  for (let i = 1; i <= 25; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: `parent-${schoolId}-${i}`,
        username: `parent${i}_${schoolId}`,
        name: `Parent ${i}`,
        surname: `Family ${i}`,
        email: `parent${i}@example.com`,
        phone: `987-654-${3210 + i}`,
        address: `${i} Family Street, Parent City`,
        schoolId: schoolId,
      },
    });
    parents.push(parent);
  }

  // ---------------
  // STUDENTS
  // ---------------
  console.log("  Creating Students...");
  const students = [];
  let studentCount = 0;
  
  // Distribute students across classes
  for (const classItem of classes) {
    // Add 15-20 students per class
    const classStudentCount = 15 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < classStudentCount; i++) {
      studentCount++;
      const studentId = `student-${schoolId}-${studentCount}`;
      
      // Assign to parent (each parent may have multiple children)
      const parentIndex = Math.floor(studentCount / 2) % parents.length;
      
      const student = await prisma.student.create({
        data: {
          id: studentId,
          username: `student${studentCount}_${schoolId}`,
          name: `Student ${studentCount}`,
          surname: `Learner ${studentCount}`,
          email: `student${studentCount}@${schoolId}.edu`,
          phone: `555-123-${4000 + studentCount}`,
          address: parents[parentIndex].address,
          bloodType: ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"][studentCount % 8],
          sex: studentCount % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 6 - Math.floor(Math.random() * 10))),
          schoolId: schoolId,
          parentId: parents[parentIndex].id,
          classId: classItem.id,
          gradeId: (await prisma.class.findUnique({
            where: { id: classItem.id },
            select: { gradeId: true },
          }))!.gradeId,
        },
      });
      students.push(student);
    }
  }

  // ---------------
  // LESSONS
  // ---------------
  console.log("  Creating Lessons...");
  const days = Object.values(Day);
  const lessons = [];
  
  // Create lessons for each class, connecting appropriate teachers and subjects
  for (const classItem of classes) {
    // Each class has 5-8 different lessons
    const lessonCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < lessonCount; i++) {
      // Pick a subject
      const subjectIndex = i % subjects.length;
      const subject = subjects[subjectIndex];
      
      // Find teachers who teach this subject
      const teachersForSubject = await prisma.teacher.findMany({
        where: {
          schoolId: schoolId,
          subjects: {
            some: {
              id: subject.id,
            },
          },
        },
      });
      
      if (teachersForSubject.length === 0) continue;
      
      // Pick a teacher from those who teach this subject
      const teacher = teachersForSubject[Math.floor(Math.random() * teachersForSubject.length)];
      
      // Generate start and end times
      const startHour = 8 + Math.floor(i / 5); // Classes start from 8 AM
      const startTime = new Date();
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startHour + 1); // Each lesson is 1 hour
      
      // Pick a day of the week
      const day = days[i % days.length];
      
      const lesson = await prisma.lesson.create({
        data: {
          name: `${subject.name} for ${classItem.name}`,
          day: day,
          startTime: startTime,
          endTime: endTime,
          subjectId: subject.id,
          classId: classItem.id,
          teacherId: teacher.id,
          schoolId: schoolId,
        },
      });
      lessons.push(lesson);
    }
  }

  // ---------------
  // EXAMS
  // ---------------
  console.log("  Creating Exams...");
  // Create 1-2 exams for some lessons
  for (let i = 0; i < lessons.length; i += 3) { // Every third lesson has an exam
    const lesson = lessons[i];
    
    // Create an exam date (2 weeks from now)
    const examDate = new Date();
    examDate.setDate(examDate.getDate() + 14 + (i % 7));
    examDate.setHours(9, 0, 0, 0); // 9 AM
    
    const examEndDate = new Date(examDate);
    examEndDate.setHours(10, 30, 0, 0); // 1.5 hour exam
    
    await prisma.exam.create({
      data: {
        title: `${lesson.name} Exam`,
        startTime: examDate,
        endTime: examEndDate,
        lessonId: lesson.id,
        schoolId: schoolId,
      },
    });
  }

  // ---------------
  // ATTENDANCE
  // ---------------
  console.log("  Creating Attendance Records...");
  // Create attendance records for the past week
  const today = new Date();
  
  // For each lesson, create attendance records for some students
  for (const lesson of lessons.slice(0, 10)) { // Limit to first 10 lessons for seed data
    // Get students in the class for this lesson
    const classStudents = await prisma.student.findMany({
      where: {
        classId: lesson.classId,
        schoolId: schoolId,
      },
    });
    
    // Create attendance for the past 5 school days
    for (let dayOffset = 5; dayOffset >= 1; dayOffset--) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(today.getDate() - dayOffset);
      
      // Skip weekends
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;
      
      // Create attendance for each student
      for (const student of classStudents) {
        // 90% attendance rate
        const isPresent = Math.random() < 0.9;
        
        await prisma.attendance.create({
          data: {
            date: attendanceDate,
            present: isPresent,
            studentId: student.id,
            lessonId: lesson.id,
            schoolId: schoolId,
          },
        });
      }
    }
  }

  // ---------------
  // EVENTS
  // ---------------
  console.log("  Creating Events...");
  const eventTitles = [
    "Parent-Teacher Conference",
    "School Sports Day",
    "Science Fair",
    "Annual Concert",
    "Field Trip",
    "Career Day",
    "Book Fair",
  ];
  
  // Create school-wide and class-specific events
  for (let i = 0; i < 5; i++) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 10 + i * 5); // Events in the future
    eventDate.setHours(10, 0, 0, 0);
    
    const eventEndDate = new Date(eventDate);
    eventEndDate.setHours(12, 0, 0, 0); // 2-hour events
    
    const title = eventTitles[i % eventTitles.length];
    
    // Some events are for specific classes, others are school-wide
    const isClassEvent = i % 2 === 0;
    
    await prisma.event.create({
      data: {
        title: title,
        description: `Join us for the ${title}. ${isClassEvent ? "This event is for a specific class." : "This is a school-wide event."}`,
        startTime: eventDate,
        endTime: eventEndDate,
        schoolId: schoolId,
        ...(isClassEvent && classes.length > 0 ? { classId: classes[i % classes.length].id } : {}),
      },
    });
  }

  // ---------------
  // ANNOUNCEMENTS
  // ---------------
  console.log("  Creating Announcements...");
  const announcementTitles = [
    "Important Schedule Change",
    "Upcoming Exam Information",
    "School Closure Notice",
    "New Curriculum Announcement",
    "After-school Program Update",
    "Lunch Menu Changes",
  ];
  
  // Create school-wide and class-specific announcements
  for (let i = 0; i < 6; i++) {
    const announcementDate = new Date();
    announcementDate.setDate(announcementDate.getDate() - (i % 3) * 2); // Some recent, some a few days old
    
    const title = announcementTitles[i % announcementTitles.length];
    
    // Some announcements are for specific classes, others are school-wide
    const isClassAnnouncement = i % 2 === 1;
    
    await prisma.announcement.create({
      data: {
        title: title,
        description: `${title}: Important information for all ${isClassAnnouncement ? "class members" : "school members"}. Please read carefully and take appropriate action.`,
        date: announcementDate,
        schoolId: schoolId,
        ...(isClassAnnouncement && classes.length > 0 ? { classId: classes[i % classes.length].id } : {}),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
