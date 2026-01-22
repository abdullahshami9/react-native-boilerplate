'use client'

import React from 'react'
import { Skill, Education } from '@/data/mock'
import { GraduationCap, Code } from 'lucide-react'

export function ProfileDetails({ skills, education, resumeUrl }: { skills: Skill[], education: Education[], resumeUrl?: string }) {
  return (
    <div className="space-y-8">
      {/* Skills */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-junr-blue" />
            <h3 className="font-bold text-lg">Professional Skills</h3>
         </div>
         <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
                <span key={skill.id} className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200">
                    {skill.skill_name}
                </span>
            ))}
         </div>
      </div>

      {/* Education */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
         <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-junr-blue" />
            <h3 className="font-bold text-lg">Education</h3>
         </div>
         <div className="space-y-4">
            {education.map(edu => (
                <div key={edu.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-bold text-gray-900 dark:text-white">{edu.institution}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{edu.degree}</p>
                    <p className="text-xs text-gray-400">{edu.year}</p>
                </div>
            ))}
         </div>
      </div>

      {/* Resume */}
      {resumeUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                  <h3 className="font-bold">Resume</h3>
                  <p className="text-sm text-gray-500">View detailed professional history</p>
              </div>
              <a href="#" className="px-4 py-2 bg-junr-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition">
                  Download PDF
              </a>
          </div>
      )}
    </div>
  )
}
