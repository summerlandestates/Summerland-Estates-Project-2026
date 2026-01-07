import type { Listing } from '../types';

export const listings: Listing[] = [
  {
    id: '1',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Margaret Thompson',
    gender: 'female',
    role: 'Estate Manager',
    location: 'Beverly Hills, CA',
    experienceYears: 15,
    rating: 4.9,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Experienced estate manager with over 15 years managing luxury properties. Specializing in staff coordination, property maintenance oversight, and household operations. Known for discretion and exceptional organizational skills.',
    skills: ['Staff Management', 'Budget Planning', 'Event Coordination', 'Vendor Relations', 'Property Maintenance'],
    experience: [
      'Managed 25,000 sq ft estate with staff of 12 for high-profile family',
      'Coordinated international travel and logistics for principal',
      'Implemented cost-saving measures reducing annual expenses by 20%',
      'Oversaw major property renovations and improvements'
    ],
    isOnlineNow: true,
    lastOnline: '2024-03-15T10:30:00Z',
    canReceiveMessages: true,
    profileStatus: 'available-for-hire',
    hideDetailedInfo: false,
    hourlyRate: '$85-$125/hour',
    languages: ['English', 'Spanish', 'French'],
    previousJobTitles: ['Estate Manager', 'Household Manager', 'Property Manager'],
    workHistory: [
      {
        jobTitle: 'Estate Manager',
        city: 'Beverly Hills, CA',
        duties: ['Managed household staff of 12', 'Oversaw $2M annual budget', 'Coordinated all property maintenance'],
        startDate: '2018',
        endDate: 'Present'
      },
      {
        jobTitle: 'Household Manager',
        city: 'Malibu, CA',
        duties: ['Supervised daily operations', 'Managed vendor relationships', 'Organized family events'],
        startDate: '2012',
        endDate: '2018'
      }
    ],
    references: [
      {
        name: 'John Anderson',
        relationship: 'Former Employer',
        phone: '(310) 555-0123',
        email: 'j.anderson@email.com'
      }
    ],
    portfolioLink: 'https://margaretthompson.com',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/margaretthompson',
      website: 'https://margaretthompson.com'
    },
    workSchedule: ['Monday-Friday', 'Weekends as needed', 'On-call availability'],
    technicalSkills: ['Property Management Software', 'Budget Management', 'Microsoft Office Suite', 'Project Management'],
    socialSkills: ['Leadership', 'Communication', 'Conflict Resolution', 'Discretion'],
    hobbies: ['Interior Design', 'Gardening', 'Wine Collecting'],
    willingToRelocate: false,
    willingToTravel: true,
    hasCarAndInsurance: true,
    certifications: ['Certified Estate Manager (CEM)', 'CPR/First Aid', 'Food Safety Manager'],
    willingToWorkWithKids: true,
    willingToWorkWithAnimals: true,
    willingToStayOvernight: true,
    willingToLiveOnSite: false,
    hasValidDriversLicense: true,
    willingToBackgroundCheck: true,
    willingToDrugTest: true,
    benefitExpectations: ['Health Insurance', '401(k)', 'Paid Time Off', 'Professional Development'],
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png'
    ],
    videoUrl: 'https://example.com/video/margaret-intro.mp4',
    resumeUrl: 'https://example.com/resumes/margaret-thompson.pdf',
    recommendationLetters: [
      'https://example.com/letters/margaret-recommendation-1.pdf',
      'https://example.com/letters/margaret-recommendation-2.pdf'
    ],
    systemsUsed: ['Lutron', 'Sonos', 'Control4', 'iPad/iOS', 'iAquaLink', 'Nest', 'Ring'],
    reviews: [
      {
        id: '1',
        reviewerName: 'Robert Williams',
        reviewerRole: 'Estate Owner',
        rating: 5,
        date: '2024-01-15',
        comment: 'Margaret has been exceptional in managing our 20,000 sq ft estate. Her attention to detail and ability to coordinate our staff of 10 is unmatched. Highly recommend.',
        verified: true
      },
      {
        id: '2',
        reviewerName: 'Jennifer Davis',
        reviewerRole: 'Property Manager',
        rating: 5,
        date: '2023-11-20',
        comment: 'Professional, discrete, and incredibly organized. Margaret transformed our household operations and saved us significant costs through her vendor management.',
        verified: true
      }
    ]
  },
  {
    id: '2',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'James Anderson',
    gender: 'male',
    role: 'Private Chef',
    location: 'Malibu, CA',
    experienceYears: 12,
    rating: 4.8,
    category: 'Staff',
    availability: false,
    verified: true,
    bio: 'Classically trained private chef specializing in international cuisine and dietary accommodations. Experience serving high-profile clients with diverse culinary preferences and nutritional requirements.',
    skills: ['French Cuisine', 'Molecular Gastronomy', 'Dietary Planning', 'Menu Development', 'Wine Pairing'],
    experience: [
      'Served as personal chef for celebrity clients for 8 years',
      'Trained at Le Cordon Bleu Paris',
      'Managed kitchen staff and catering for events up to 200 guests',
      'Expert in allergen-free and specialized diet preparation'
    ],
    isOnlineNow: false,
    lastOnline: '2024-03-14T18:45:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: true,
    hourlyRate: '$95-$150/hour',
    languages: ['English', 'French', 'Italian'],
    previousJobTitles: ['Private Chef', 'Executive Chef', 'Sous Chef'],
    workHistory: [
      {
        jobTitle: 'Private Chef',
        city: 'Malibu, CA',
        duties: ['Prepared daily meals for family of 6', 'Managed kitchen inventory', 'Catered private events'],
        startDate: '2016',
        endDate: 'Present'
      },
      {
        jobTitle: 'Executive Chef',
        city: 'Los Angeles, CA',
        duties: ['Led kitchen team of 8', 'Developed seasonal menus', 'Maintained Michelin standards'],
        startDate: '2012',
        endDate: '2016'
      }
    ],
    references: [
      {
        name: 'Sarah Mitchell',
        relationship: 'Former Client',
        phone: '(310) 555-0456',
        email: 's.mitchell@email.com'
      }
    ],
    socialLinks: {
      instagram: 'https://instagram.com/chefjamesanderson',
      website: 'https://jamesandersonchef.com'
    },
    workSchedule: ['Full-time live-in', 'Part-time available', 'Event catering'],
    technicalSkills: ['French Cuisine', 'Molecular Gastronomy', 'Pastry', 'Butchery', 'Food Safety'],
    socialSkills: ['Team Leadership', 'Client Relations', 'Adaptability', 'Attention to Detail'],
    hobbies: ['Food Photography', 'Foraging', 'Wine Tasting'],
    willingToRelocate: true,
    willingToTravel: true,
    hasCarAndInsurance: true,
    certifications: ['Le Cordon Bleu Diploma', 'ServSafe Manager', 'Sommelier Level 2'],
    willingToWorkWithKids: true,
    willingToWorkWithAnimals: false,
    willingToStayOvernight: true,
    willingToLiveOnSite: true,
    hasValidDriversLicense: true,
    willingToBackgroundCheck: true,
    willingToDrugTest: true,
    benefitExpectations: ['Health Insurance', 'Housing', 'Meals Provided', 'Paid Time Off'],
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png'
    ],
    recommendationLetters: [
      'https://example.com/letters/james-recommendation-1.pdf'
    ],
    systemsUsed: ['iPad/iOS', 'Kitchen Management Software', 'Inventory Systems'],
    reviews: [
      {
        id: '1',
        reviewerName: 'Michael Chen',
        reviewerRole: 'Private Client',
        rating: 5,
        date: '2024-02-10',
        comment: 'James is a culinary artist. His ability to accommodate dietary restrictions while maintaining exceptional taste is remarkable. Our family and guests are always impressed.',
        verified: true
      }
    ]
  },
  {
    id: '3',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'Sarah Mitchell',
    gender: 'female',
    role: 'Household Manager',
    location: 'Newport Beach, CA',
    experienceYears: 10,
    rating: 4.7,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Detail-oriented household manager with expertise in maintaining luxury residences. Skilled in staff supervision, inventory management, and ensuring seamless daily operations.',
    skills: ['Staff Supervision', 'Inventory Management', 'Scheduling', 'Vendor Coordination', 'Quality Control'],
    experience: [
      'Managed multiple properties for international business executive',
      'Coordinated household staff of 8 across primary and vacation homes',
      'Implemented digital systems for improved household efficiency',
      'Maintained impeccable standards for property presentation'
    ]
  },
  {
    id: '4',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png',
    name: 'Elite Landscaping Services',
    role: 'Landscape Design & Maintenance',
    location: 'Los Angeles, CA',
    experienceYears: 20,
    rating: 4.9,
    category: 'Vendor',
    availability: true,
    verified: true,
    bio: 'Premier landscaping company specializing in estate grounds maintenance and design. Award-winning team with expertise in sustainable practices and luxury outdoor spaces.',
    skills: ['Landscape Design', 'Irrigation Systems', 'Hardscaping', 'Sustainable Practices', 'Seasonal Planning'],
    experience: [
      'Maintained grounds for 50+ luxury estates in Southern California',
      'Award-winning landscape designs featured in architectural magazines',
      'Specialized in water-efficient and drought-resistant landscaping',
      'Full-service maintenance including tree care and pest management'
    ]
  },
  {
    id: '5',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Robert Chen',
    gender: 'male',
    role: 'Security Director',
    location: 'San Francisco, CA',
    experienceYears: 18,
    rating: 5.0,
    category: 'Staff',
    availability: false,
    verified: true,
    bio: 'Former Secret Service agent with extensive experience in executive protection and estate security. Expert in threat assessment, security system design, and staff training.',
    skills: ['Executive Protection', 'Security Systems', 'Risk Assessment', 'Staff Training', 'Emergency Response'],
    experience: [
      'Served in Presidential Protection Division for 10 years',
      'Designed and implemented security protocols for high-net-worth families',
      'Managed security teams of up to 15 personnel',
      'Expert in cybersecurity and digital privacy protection'
    ]
  },
  {
    id: '6',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'Premium Pool Services',
    role: 'Pool & Spa Maintenance',
    location: 'Santa Barbara, CA',
    experienceYears: 15,
    rating: 4.8,
    category: 'Vendor',
    availability: true,
    verified: true,
    bio: 'Specialized pool and spa maintenance company serving luxury estates. Expert in complex water features, infinity pools, and automated systems.',
    skills: ['Pool Maintenance', 'Water Chemistry', 'Equipment Repair', 'Automation Systems', 'Water Features'],
    experience: [
      'Service provider for 100+ luxury residential pools',
      'Certified in all major pool equipment brands',
      'Emergency repair services available 24/7',
      'Expertise in saltwater systems and eco-friendly solutions'
    ]
  },
  {
    id: '7',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'Diana Foster',
    gender: 'female',
    role: 'Personal Assistant',
    location: 'Pasadena, CA',
    experienceYears: 8,
    rating: 4.9,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Highly organized personal assistant with experience supporting C-level executives and high-net-worth individuals. Skilled in complex scheduling, travel coordination, and confidential matters.',
    skills: ['Calendar Management', 'Travel Planning', 'Correspondence', 'Event Planning', 'Confidentiality'],
    experience: [
      'Supported Fortune 500 CEO for 5 years',
      'Managed international travel logistics across 6 continents',
      'Coordinated personal and professional schedules seamlessly',
      'Expert in luxury concierge services and vendor relations'
    ]
  },
  {
    id: '8',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png',
    name: 'Michael Torres',
    gender: 'male',
    role: 'Wine Cellar Manager',
    location: 'Napa Valley, CA',
    experienceYears: 14,
    rating: 4.7,
    category: 'Staff',
    availability: false,
    verified: true,
    bio: 'Certified sommelier and wine cellar specialist with expertise in collection management, acquisition, and cellar design. Deep knowledge of fine wines and optimal storage conditions.',
    skills: ['Wine Selection', 'Cellar Management', 'Climate Control', 'Inventory Systems', 'Wine Education'],
    experience: [
      'Managed collections valued over $5 million',
      'Advanced Sommelier certification from Court of Master Sommeliers',
      'Designed and implemented custom cellar management systems',
      'Sourced rare and allocated wines from global vineyards'
    ]
  },
  {
    id: '9',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Prestige Auto Care',
    role: 'Luxury Vehicle Maintenance',
    location: 'Beverly Hills, CA',
    experienceYears: 12,
    rating: 4.9,
    category: 'Vendor',
    availability: true,
    verified: true,
    bio: 'Specialized automotive service for luxury and exotic vehicles. Factory-trained technicians with expertise in high-end European and American marques.',
    skills: ['Exotic Car Maintenance', 'Detailing', 'Concierge Service', 'Fleet Management', 'Storage Solutions'],
    experience: [
      'Certified service center for Ferrari, Lamborghini, and Rolls-Royce',
      'Mobile service available for estate collections',
      'Climate-controlled storage facilities',
      'Full detailing and preservation services'
    ]
  },
  {
    id: '10',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'Alexandra Wright',
    gender: 'female',
    role: 'Art Curator',
    location: 'Los Angeles, CA',
    experienceYears: 16,
    rating: 5.0,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Museum-trained art curator specializing in private collections. Expert in acquisition, authentication, conservation, and display of fine art and collectibles.',
    skills: ['Art Authentication', 'Collection Management', 'Conservation', 'Acquisition Strategy', 'Exhibition Design'],
    experience: [
      'Former curator at major metropolitan museum',
      'Managed private collections valued over $50 million',
      'Expert in Old Masters, Impressionist, and Contemporary art',
      'Established relationships with major galleries and auction houses'
    ]
  },
  {
    id: '11',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'Elite Home Technology',
    role: 'Smart Home Integration',
    location: 'San Diego, CA',
    experienceYears: 10,
    rating: 4.8,
    category: 'Vendor',
    availability: true,
    verified: true,
    bio: 'Leading smart home technology integrator specializing in luxury estates. Expert in automation, security systems, and cutting-edge home technology.',
    skills: ['Home Automation', 'Security Systems', 'Audio/Visual', 'Network Infrastructure', 'System Integration'],
    experience: [
      'Integrated technology in 200+ luxury homes',
      'Certified by major automation brands (Crestron, Control4, Savant)',
      'Custom programming for unique client requirements',
      '24/7 technical support and maintenance services'
    ]
  },
  {
    id: '12',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png',
    name: 'Thomas Bennett',
    gender: 'male',
    role: 'Chauffeur',
    location: 'Orange County, CA',
    experienceYears: 20,
    rating: 4.9,
    category: 'Staff',
    availability: false,
    verified: true,
    bio: 'Professional chauffeur with two decades of experience serving high-profile clients. Expert in luxury vehicle operation, route planning, and discretion.',
    skills: ['Luxury Vehicle Operation', 'Route Planning', 'Security Awareness', 'Maintenance Oversight', 'Discretion'],
    experience: [
      'Served celebrities, executives, and diplomatic personnel',
      'Advanced defensive driving certification',
      'Expert knowledge of Southern California routes and traffic patterns',
      'Maintained fleet of luxury vehicles including Rolls-Royce and Mercedes-Maybach'
    ]
  },
  {
    id: '13',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Jennifer Martinez',
    gender: 'female',
    role: 'Nanny',
    location: 'Santa Monica, CA',
    experienceYears: 11,
    rating: 5.0,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Experienced professional nanny with expertise in early childhood development and education. Certified in CPR, first aid, and child safety. Fluent in English and Spanish.',
    skills: ['Child Development', 'Educational Activities', 'Safety & First Aid', 'Nutrition', 'Bilingual'],
    experience: [
      'Cared for children from infancy through adolescence',
      'Degree in Early Childhood Education',
      'Implemented age-appropriate educational programs',
      'Coordinated with tutors, coaches, and activity schedules'
    ]
  },
  {
    id: '14',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'Luxury Floral Design',
    role: 'Floral Services',
    location: 'Beverly Hills, CA',
    experienceYears: 18,
    rating: 4.9,
    category: 'Vendor',
    availability: true,
    verified: true,
    bio: 'Premier floral design studio serving luxury estates and events. Specializing in weekly arrangements, special occasions, and garden consultation.',
    skills: ['Floral Design', 'Event Florals', 'Garden Consultation', 'Seasonal Arrangements', 'Exotic Flowers'],
    experience: [
      'Provided weekly floral services for 50+ estates',
      'Designed florals for celebrity weddings and galas',
      'Direct relationships with international flower markets',
      'Custom arrangements using rare and exotic blooms'
    ]
  },
  {
    id: '15',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'David Kim',
    gender: 'male',
    role: 'Property Maintenance Manager',
    location: 'Laguna Beach, CA',
    experienceYears: 13,
    rating: 4.8,
    category: 'Staff',
    availability: true,
    verified: true,
    bio: 'Skilled property maintenance manager with expertise in all aspects of estate upkeep. Licensed contractor with specialization in luxury property systems and preventive maintenance.',
    skills: ['Property Maintenance', 'Contractor Management', 'Preventive Maintenance', 'Emergency Repairs', 'Budget Management'],
    experience: [
      'Managed maintenance for estates up to 30,000 sq ft',
      'Licensed general contractor in California',
      'Coordinated major renovations and system upgrades',
      'Established preventive maintenance programs reducing emergency repairs by 40%'
    ]
  },
  {
    id: '16',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Premier Estate Services',
    role: 'Full-Service Estate Management',
    location: 'Los Angeles, CA',
    experienceYears: 15,
    rating: 4.9,
    category: 'Business',
    availability: true,
    verified: true,
    bio: 'Premier Estate Services provides comprehensive estate management solutions including staff placement, property maintenance coordination, and concierge services. We serve luxury estates throughout Southern California with a commitment to excellence and discretion.',
    isOnlineNow: true,
    lastOnline: '2024-03-15T11:00:00Z',
    canReceiveMessages: true,
    businessWebsite: 'https://premierestateservices.com',
    businessEmail: 'info@premierestateservices.com',
    businessPhone: '(310) 555-7890',
    businessAddress: '456 Wilshire Blvd, Suite 200, Los Angeles, CA 90010',
    businessHours: [
      { day: 'Monday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Tuesday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Wednesday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Thursday', open: '8:00 AM', close: '6:00 PM' },
      { day: 'Friday', open: '8:00 AM', close: '5:00 PM' },
      { day: 'Saturday', open: '9:00 AM', close: '2:00 PM' },
      { day: 'Sunday', open: '', close: '', closed: true }
    ],
    servicesOffered: [
      {
        name: 'Estate Management Consultation',
        description: 'Initial assessment and customized management plan for your property',
        price: '$500',
        duration: '2 hours'
      },
      {
        name: 'Monthly Estate Management',
        description: 'Comprehensive monthly management including staff coordination, vendor management, and property oversight',
        price: '$5,000/month',
        duration: 'Ongoing'
      },
      {
        name: 'Staff Placement Service',
        description: 'Full recruitment and placement of household staff with background checks and references',
        price: '$2,500 per placement',
        duration: '4-6 weeks'
      },
      {
        name: 'Property Inspection',
        description: 'Detailed property inspection with maintenance recommendations',
        price: '$750',
        duration: '3 hours'
      }
    ],
    coverageAreas: ['Los Angeles', 'Beverly Hills', 'Malibu', 'Santa Monica', 'Pasadena', 'Newport Beach'],
    coupons: [
      {
        code: 'NEWCLIENT2024',
        description: '20% off first month of estate management services',
        discount: '20%',
        expiryDate: '2024-12-31'
      },
      {
        code: 'CONSULTATION50',
        description: '$50 off initial consultation',
        discount: '$50',
        expiryDate: '2024-12-31'
      }
    ],
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png'
    ],
    videoUrl: 'https://example.com/video/premier-estate-intro.mp4',
    userManuals: [
      {
        id: '1',
        title: 'Estate Management Services Guide',
        description: 'Complete guide to our estate management services, processes, and best practices',
        fileUrl: '/manuals/estate-management-guide.pdf',
        uploadDate: '2024-01-15',
        fileSize: '2.5 MB',
        fileType: 'PDF'
      },
      {
        id: '2',
        title: 'Staff Placement Process Manual',
        description: 'Step-by-step guide for our staff recruitment and placement services',
        fileUrl: '/manuals/staff-placement-manual.pdf',
        uploadDate: '2024-02-01',
        fileSize: '1.8 MB',
        fileType: 'PDF'
      }
    ],
    bookingEnabled: true,
    depositRequired: true,
    depositAmount: '50%',
    invoicingEnabled: true,
    paymentTerms: 'Net 30',
    chatEnabled: true,
    reviews: [
      {
        id: '1',
        reviewerName: 'Elizabeth Thompson',
        reviewerRole: 'Estate Owner',
        rating: 5,
        date: '2024-01-20',
        comment: 'Premier Estate Services has transformed how we manage our properties. Their attention to detail and professionalism is outstanding. Highly recommend their monthly management service.',
        verified: true
      },
      {
        id: '2',
        reviewerName: 'David Martinez',
        reviewerRole: 'Property Manager',
        rating: 5,
        date: '2023-12-15',
        comment: 'Excellent service from start to finish. They helped us find the perfect estate manager and provided ongoing support. Worth every penny.',
        verified: true
      }
    ]
  },
  {
    id: '17',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'Luxury Home Cleaning Co.',
    role: 'Professional Cleaning Services',
    location: 'Beverly Hills, CA',
    experienceYears: 10,
    rating: 4.8,
    category: 'Business' as const,
    availability: true,
    verified: true,
    bio: 'Luxury Home Cleaning Co. specializes in high-end residential cleaning services for estates and luxury homes. Our trained professionals use eco-friendly products and provide white-glove service with complete discretion.',
    isOnlineNow: true,
    lastOnline: '2024-03-15T10:15:00Z',
    canReceiveMessages: true,
    businessWebsite: 'https://luxuryhomecleaning.com',
    businessEmail: 'bookings@luxuryhomecleaning.com',
    businessPhone: '(310) 555-2468',
    businessAddress: '789 Rodeo Drive, Beverly Hills, CA 90210',
    businessHours: [
      { day: 'Monday', open: '7:00 AM', close: '7:00 PM' },
      { day: 'Tuesday', open: '7:00 AM', close: '7:00 PM' },
      { day: 'Wednesday', open: '7:00 AM', close: '7:00 PM' },
      { day: 'Thursday', open: '7:00 AM', close: '7:00 PM' },
      { day: 'Friday', open: '7:00 AM', close: '7:00 PM' },
      { day: 'Saturday', open: '8:00 AM', close: '5:00 PM' },
      { day: 'Sunday', open: '9:00 AM', close: '3:00 PM' }
    ],
    servicesOffered: [
      {
        name: 'Deep Cleaning',
        description: 'Comprehensive deep cleaning of entire property including all surfaces, fixtures, and hard-to-reach areas',
        price: '$800-$2,000',
        duration: '6-8 hours'
      },
      {
        name: 'Regular Maintenance Cleaning',
        description: 'Weekly or bi-weekly cleaning service to maintain property standards',
        price: '$400-$800 per visit',
        duration: '4-6 hours'
      },
      {
        name: 'Move-In/Move-Out Cleaning',
        description: 'Thorough cleaning for property transitions',
        price: '$1,200-$3,000',
        duration: '8-12 hours'
      },
      {
        name: 'Post-Event Cleaning',
        description: 'Complete cleanup after parties and events',
        price: '$600-$1,500',
        duration: '4-8 hours'
      }
    ],
    coverageAreas: ['Beverly Hills', 'Bel Air', 'Holmby Hills', 'Pacific Palisades', 'Malibu', 'Santa Monica'],
    coupons: [
      {
        code: 'FIRST100',
        description: '$100 off your first deep cleaning service',
        discount: '$100',
        expiryDate: '2024-12-31'
      }
    ],
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png'
    ],
    userManuals: [
      {
        id: '1',
        title: 'Cleaning Services Manual',
        description: 'Our cleaning standards, procedures, and service offerings',
        fileUrl: '/manuals/cleaning-services-manual.pdf',
        uploadDate: '2024-01-20',
        fileSize: '1.2 MB',
        fileType: 'PDF'
      }
    ],
    bookingEnabled: true,
    depositRequired: false,
    invoicingEnabled: true,
    paymentTerms: 'Due upon completion',
    chatEnabled: true,
    reviews: [
      {
        id: '1',
        reviewerName: 'Amanda Wilson',
        reviewerRole: 'Homeowner',
        rating: 5,
        date: '2024-02-05',
        comment: 'Impeccable service! The team is professional, thorough, and respectful of our home. They use eco-friendly products which is important to us.',
        verified: true
      }
    ]
  },
  {
    id: '18',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png',
    name: 'Patricia Reynolds',
    gender: 'female',
    title: 'Senior Recruiter',
    role: 'Agency Owner',
    location: 'Los Angeles, CA',
    experienceYears: 0,
    yearsInIndustry: 18,
    rating: 4.9,
    category: 'Agency' as const,
    availability: true,
    verified: true,
    bio: '',
    agencyWebsite: 'https://eliteestateplacements.com',
    agencyBio: 'Elite Estate Placements is a premier staffing agency specializing in luxury estate staffing. We connect high-net-worth families with exceptional household professionals including estate managers, private chefs, nannies, housekeepers, and more. Our rigorous vetting process ensures only the most qualified candidates.',
    individualBio: 'With 18 years of experience in luxury estate staffing, I have successfully placed over 500 professionals in prestigious households across California. My expertise includes executive-level placements, full household staffing, and specialized roles. I pride myself on understanding both client needs and candidate aspirations to create perfect matches.',
    primaryMarkets: ['Los Angeles', 'Beverly Hills', 'Malibu', 'Santa Monica', 'Pasadena', 'Newport Beach', 'San Francisco'],
    responseExpectations: 'Within 4 hours during business hours',
    hoursAvailable: 'Monday-Friday 8am-7pm, Saturday 10am-4pm',
    isOnlineNow: true,
    lastOnline: '2024-03-15T11:30:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: false,
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png'
    ],
    bookingEnabled: true,
    chatEnabled: true,
    reviews: [
      {
        id: '1',
        reviewerName: 'Katherine Williams',
        reviewerRole: 'Estate Owner',
        rating: 5,
        date: '2024-02-20',
        comment: 'Patricia found us the perfect estate manager within two weeks. Her understanding of our needs and attention to detail was exceptional. Highly recommend her services.',
        verified: true
      },
      {
        id: '2',
        reviewerName: 'Michael Chen',
        reviewerRole: 'Private Chef',
        rating: 5,
        date: '2024-01-15',
        comment: 'Working with Patricia was a game-changer for my career. She placed me in an amazing position that perfectly matched my skills and career goals. Professional and responsive throughout the entire process.',
        verified: true
      }
    ]
  },
  {
    id: '19',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Richard Hamilton',
    gender: 'male',
    role: 'Estate Principal',
    location: 'Bel Air, CA',
    experienceYears: 0,
    rating: 5.0,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'principal' as const,
    availability: true,
    verified: true,
    bio: 'Seeking experienced estate management professionals for our 30,000 sq ft property. Looking for a full-time estate manager, private chef, and housekeeping staff. Prefer candidates with experience in luxury estates and excellent references.',
    isOnlineNow: false,
    lastOnline: '2024-03-14T16:20:00Z',
    canReceiveMessages: true,
    photoHidden: false,
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png'
    ]
  },
  {
    id: '20',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'Anonymous Estate',
    role: 'Estate Principal',
    location: 'Pacific Palisades, CA',
    experienceYears: 0,
    rating: 4.8,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'principal' as const,
    availability: true,
    verified: true,
    bio: 'High-net-worth family seeking discreet and professional household staff. Currently hiring for multiple positions including personal assistant, security director, and household manager. All candidates must be willing to undergo thorough background checks.',
    isOnlineNow: true,
    lastOnline: '2024-03-15T10:45:00Z',
    canReceiveMessages: true,
    photoHidden: true,
    profilePhotos: []
  },
  {
    id: '21',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
    name: 'Margaret Thompson',
    role: 'Estate Manager',
    location: 'Beverly Hills, CA',
    experienceYears: 15,
    rating: 4.9,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'estate-manager' as const,
    availability: true,
    verified: true,
    bio: 'Currently hiring for our 25,000 sq ft Beverly Hills estate. Seeking experienced household staff including housekeepers, private chef, and security personnel. We value discretion, professionalism, and attention to detail.',
    isOnlineNow: true,
    lastOnline: '2024-03-15T10:30:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: true,
    hourlyRate: '$85-$125/hour',
    languages: ['English', 'Spanish', 'French'],
    previousJobTitles: ['Estate Manager', 'Household Manager', 'Property Manager'],
    workHistory: [
      {
        jobTitle: 'Estate Manager',
        city: 'Beverly Hills, CA',
        duties: ['Managed household staff of 12', 'Oversaw $2M annual budget', 'Coordinated all property maintenance'],
        startDate: '2018',
        endDate: 'Present'
      },
      {
        jobTitle: 'Household Manager',
        city: 'Malibu, CA',
        duties: ['Supervised daily operations', 'Managed vendor relationships', 'Organized family events'],
        startDate: '2012',
        endDate: '2018'
      }
    ],
    references: [
      {
        name: 'John Anderson',
        relationship: 'Former Employer',
        phone: '(310) 555-0123',
        email: 'j.anderson@email.com'
      }
    ],
    portfolioLink: 'https://margaretthompson.com',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/margaretthompson',
      website: 'https://margaretthompson.com'
    },
    workSchedule: ['Monday-Friday', 'Weekends as needed', 'On-call availability'],
    technicalSkills: ['Property Management Software', 'Budget Management', 'Microsoft Office Suite', 'Project Management'],
    socialSkills: ['Leadership', 'Communication', 'Conflict Resolution', 'Discretion'],
    hobbies: ['Interior Design', 'Gardening', 'Wine Collecting'],
    willingToRelocate: false,
    willingToTravel: true,
    hasCarAndInsurance: true,
    certifications: ['Certified Estate Manager (CEM)', 'CPR/First Aid', 'Food Safety Manager'],
    willingToWorkWithKids: true,
    willingToWorkWithAnimals: true,
    willingToStayOvernight: true,
    willingToLiveOnSite: false,
    hasValidDriversLicense: true,
    willingToBackgroundCheck: true,
    willingToDrugTest: true,
    benefitExpectations: ['Health Insurance', '401(k)', 'Paid Time Off', 'Professional Development'],
    profilePhotos: [
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_1.png',
      'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png'
    ],
    videoUrl: 'https://example.com/video/margaret-intro.mp4',
    resumeUrl: 'https://example.com/resumes/margaret-thompson.pdf',
    systemsUsed: ['Lutron', 'Sonos', 'Control4', 'iPad/iOS', 'iAquaLink', 'Nest', 'Ring'],
    reviews: [
      {
        id: '1',
        reviewerName: 'Robert Williams',
        reviewerRole: 'Estate Owner',
        rating: 5,
        date: '2024-01-15',
        comment: 'Margaret has been exceptional in managing our 20,000 sq ft estate. Her attention to detail and ability to coordinate our staff of 10 is unmatched. Highly recommend.',
        verified: true
      }
    ]
  },
  {
    id: '22',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_4.png',
    name: 'Robert Chen',
    role: 'Chief of Staff',
    location: 'San Francisco, CA',
    experienceYears: 18,
    rating: 5.0,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'chief-of-staff' as const,
    availability: false,
    verified: true,
    bio: 'Managing security and operations for a prominent San Francisco estate. Currently building our security team and seeking experienced protection specialists and estate security personnel.',
    isOnlineNow: false,
    lastOnline: '2024-03-14T18:45:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: true
  },
  {
    id: '23',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_3.png',
    name: 'Diana Foster',
    role: 'Personal Assistant',
    location: 'Pasadena, CA',
    experienceYears: 8,
    rating: 4.9,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'personal-assistant' as const,
    availability: true,
    verified: true,
    bio: 'Coordinating staffing for our principal\'s Pasadena residence. Looking for additional household support including part-time housekeeper and weekend chef. Must have excellent references.',
    isOnlineNow: true,
    lastOnline: '2024-03-15T11:00:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: true
  },
  {
    id: '24',
    profilePhoto: 'https://c.animaapp.com/mjqmlnqaRP5DSj/img/ai_2.png',
    name: 'Alexandra Wright',
    role: 'Executive Assistant',
    location: 'Los Angeles, CA',
    experienceYears: 12,
    rating: 5.0,
    category: 'Estates' as const,
    accountType: 'estates' as const,
    estatesRole: 'executive-assistant' as const,
    availability: true,
    verified: true,
    bio: 'Managing recruitment for our Los Angeles estate. Currently seeking an estate manager to oversee daily operations and coordinate our household staff of 8. Competitive compensation and benefits package.',
    isOnlineNow: false,
    lastOnline: '2024-03-14T16:30:00Z',
    canReceiveMessages: true,
    profileStatus: 'actively-hiring',
    hideDetailedInfo: true
  }
];
