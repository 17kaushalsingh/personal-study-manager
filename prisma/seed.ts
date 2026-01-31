import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjects = [
  {
    name: 'DSA',
    description: 'Data Structures and Algorithms - The foundation of technical interviews',
    icon: '🔢',
    order: 1,
    topics: [
      { name: 'Arrays', description: 'Static and dynamic arrays, operations, and common patterns', order: 1 },
      { name: 'Strings', description: 'String manipulation, pattern matching, and algorithms', order: 2 },
      { name: 'Linked Lists', description: 'Singly, doubly linked lists, and operations', order: 3 },
      { name: 'Stacks & Queues', description: 'LIFO and FIFO structures, applications', order: 4 },
      { name: 'Trees', description: 'Binary trees, BST, traversals, and operations', order: 5 },
      { name: 'Graphs', description: 'Graph representations, BFS, DFS, shortest paths', order: 6 },
      { name: 'Heaps', description: 'Min/Max heaps, priority queues', order: 7 },
      { name: 'Hash Tables', description: 'Hashing, collision resolution, applications', order: 8 },
      { name: 'Dynamic Programming', description: 'Memoization, tabulation, classic problems', order: 9 },
      { name: 'Greedy Algorithms', description: 'Greedy approach and optimization', order: 10 },
      { name: 'Backtracking', description: 'Recursive exploration and pruning', order: 11 },
      { name: 'Sorting', description: 'Comparison and non-comparison sorting algorithms', order: 12 },
      { name: 'Searching', description: 'Binary search, two pointers, sliding window', order: 13 },
      { name: 'Bit Manipulation', description: 'Bitwise operations and tricks', order: 14 },
    ],
  },
  {
    name: 'Competitive Programming',
    description: 'Advanced problem-solving and contest strategies',
    icon: '🏆',
    order: 2,
    topics: [
      { name: 'Number Theory', description: 'Prime numbers, GCD, modular arithmetic', order: 1 },
      { name: 'Combinatorics', description: 'Counting, permutations, combinations', order: 2 },
      { name: 'Segment Trees', description: 'Range queries and updates', order: 3 },
      { name: 'Fenwick Trees', description: 'Binary indexed trees for prefix sums', order: 4 },
      { name: 'Tries', description: 'Prefix trees for string operations', order: 5 },
      { name: 'Advanced DP', description: 'Bitmask DP, digit DP, tree DP', order: 6 },
      { name: 'Graph Algorithms', description: 'MST, strongly connected components, flows', order: 7 },
      { name: 'String Algorithms', description: 'KMP, Z-algorithm, suffix arrays', order: 8 },
    ],
  },
  {
    name: 'Operating Systems',
    description: 'Core OS concepts for system design and interviews',
    icon: '💻',
    order: 3,
    topics: [
      { name: 'Process Management', description: 'Processes, threads, scheduling', order: 1 },
      { name: 'Memory Management', description: 'Virtual memory, paging, segmentation', order: 2 },
      { name: 'File Systems', description: 'File organization, directories, storage', order: 3 },
      { name: 'Synchronization', description: 'Locks, semaphores, deadlocks', order: 4 },
      { name: 'Inter-Process Communication', description: 'Pipes, shared memory, message queues', order: 5 },
      { name: 'CPU Scheduling', description: 'FCFS, SJF, Round Robin, priority scheduling', order: 6 },
      { name: 'I/O Systems', description: 'Device drivers, DMA, disk scheduling', order: 7 },
    ],
  },
  {
    name: 'Object-Oriented Programming',
    description: 'OOP principles and design patterns',
    icon: '🎯',
    order: 4,
    topics: [
      { name: 'Classes & Objects', description: 'Class design, constructors, methods', order: 1 },
      { name: 'Inheritance', description: 'Hierarchies, abstract classes, interfaces', order: 2 },
      { name: 'Polymorphism', description: 'Method overloading, overriding, virtual functions', order: 3 },
      { name: 'Encapsulation', description: 'Access modifiers, getters/setters', order: 4 },
      { name: 'Abstraction', description: 'Abstract classes, interfaces, contracts', order: 5 },
      { name: 'SOLID Principles', description: 'Single responsibility, open/closed, etc.', order: 6 },
      { name: 'Design Patterns', description: 'Creational, structural, behavioral patterns', order: 7 },
    ],
  },
  {
    name: 'Database Management',
    description: 'SQL, NoSQL, and database design concepts',
    icon: '🗄️',
    order: 5,
    topics: [
      { name: 'SQL Fundamentals', description: 'SELECT, JOIN, subqueries, aggregations', order: 1 },
      { name: 'Normalization', description: '1NF, 2NF, 3NF, BCNF', order: 2 },
      { name: 'Indexing', description: 'B-trees, hash indexes, query optimization', order: 3 },
      { name: 'Transactions', description: 'ACID properties, isolation levels', order: 4 },
      { name: 'NoSQL Databases', description: 'Document, key-value, column stores', order: 5 },
      { name: 'Database Design', description: 'ER diagrams, schema design, relationships', order: 6 },
      { name: 'Query Optimization', description: 'Explain plans, query tuning', order: 7 },
    ],
  },
  {
    name: 'Computer Networks',
    description: 'Networking concepts and protocols',
    icon: '🌐',
    order: 6,
    topics: [
      { name: 'OSI Model', description: 'Seven layers and their functions', order: 1 },
      { name: 'TCP/IP', description: 'TCP, UDP, IP addressing, subnetting', order: 2 },
      { name: 'HTTP/HTTPS', description: 'Web protocols, TLS, REST', order: 3 },
      { name: 'DNS', description: 'Domain name resolution, caching', order: 4 },
      { name: 'Load Balancing', description: 'Algorithms, health checks, session persistence', order: 5 },
      { name: 'Network Security', description: 'Firewalls, VPNs, encryption', order: 6 },
      { name: 'Sockets', description: 'Socket programming, WebSockets', order: 7 },
    ],
  },
  {
    name: 'Low-Level Design',
    description: 'Object-oriented design and class diagrams',
    icon: '📐',
    order: 7,
    topics: [
      { name: 'UML Diagrams', description: 'Class, sequence, use case diagrams', order: 1 },
      { name: 'Design Patterns', description: 'Factory, singleton, observer, strategy', order: 2 },
      { name: 'SOLID Principles', description: 'Applying SOLID in real designs', order: 3 },
      { name: 'Parking Lot System', description: 'Classic LLD problem', order: 4 },
      { name: 'Library Management', description: 'Books, members, borrowing system', order: 5 },
      { name: 'Elevator System', description: 'Multi-elevator coordination', order: 6 },
      { name: 'Chess Game', description: 'Pieces, board, game rules', order: 7 },
      { name: 'ATM System', description: 'Banking operations, accounts', order: 8 },
    ],
  },
  {
    name: 'High-Level Design',
    description: 'System design and distributed systems',
    icon: '🏗️',
    order: 8,
    topics: [
      { name: 'Scalability', description: 'Horizontal vs vertical scaling', order: 1 },
      { name: 'Load Balancing', description: 'Algorithms, CDNs, reverse proxies', order: 2 },
      { name: 'Caching', description: 'Cache strategies, Redis, Memcached', order: 3 },
      { name: 'Database Sharding', description: 'Partitioning, replication, consistency', order: 4 },
      { name: 'Message Queues', description: 'Kafka, RabbitMQ, async processing', order: 5 },
      { name: 'Microservices', description: 'Service decomposition, API gateway', order: 6 },
      { name: 'URL Shortener', description: 'Classic HLD problem', order: 7 },
      { name: 'Twitter/Feed Design', description: 'Timeline, fanout, real-time', order: 8 },
      { name: 'Chat System', description: 'Real-time messaging, presence', order: 9 },
      { name: 'Video Streaming', description: 'CDN, encoding, adaptive bitrate', order: 10 },
    ],
  },
  {
    name: 'DevOps',
    description: 'CI/CD, containerization, and cloud services',
    icon: '🔧',
    order: 9,
    topics: [
      { name: 'Git', description: 'Version control, branching strategies', order: 1 },
      { name: 'Docker', description: 'Containers, images, Docker Compose', order: 2 },
      { name: 'Kubernetes', description: 'Orchestration, pods, services, deployments', order: 3 },
      { name: 'CI/CD', description: 'Jenkins, GitHub Actions, pipelines', order: 4 },
      { name: 'Cloud Services', description: 'AWS, GCP, Azure basics', order: 5 },
      { name: 'Infrastructure as Code', description: 'Terraform, CloudFormation', order: 6 },
      { name: 'Monitoring', description: 'Logging, metrics, alerting', order: 7 },
      { name: 'Linux Fundamentals', description: 'Shell, file systems, permissions', order: 8 },
    ],
  },
  {
    name: 'Artificial Intelligence',
    description: 'Machine learning and AI fundamentals',
    icon: '🤖',
    order: 10,
    topics: [
      { name: 'Linear Algebra', description: 'Vectors, matrices, transformations', order: 1 },
      { name: 'Probability & Statistics', description: 'Distributions, hypothesis testing', order: 2 },
      { name: 'Supervised Learning', description: 'Regression, classification algorithms', order: 3 },
      { name: 'Unsupervised Learning', description: 'Clustering, dimensionality reduction', order: 4 },
      { name: 'Neural Networks', description: 'Perceptrons, backpropagation, architectures', order: 5 },
      { name: 'Deep Learning', description: 'CNNs, RNNs, transformers', order: 6 },
      { name: 'NLP Basics', description: 'Tokenization, embeddings, language models', order: 7 },
      { name: 'Model Evaluation', description: 'Metrics, cross-validation, bias-variance', order: 8 },
    ],
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();

  console.log('📚 Creating subjects and topics...');

  for (const subjectData of subjects) {
    const { topics, ...subjectInfo } = subjectData;

    await prisma.subject.create({
      data: {
        ...subjectInfo,
        isDefault: true,
        topics: {
          create: topics,
        },
      },
    });

    console.log(`  ✅ Created: ${subjectData.name}`);
  }

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log(`   Created ${subjects.length} subjects with ${subjects.reduce((acc, s) => acc + s.topics.length, 0)} topics`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
