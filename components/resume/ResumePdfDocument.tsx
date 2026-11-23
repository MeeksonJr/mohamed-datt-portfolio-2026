import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ResumeDocumentData } from '@/lib/resume/resume-presets'

const styles = StyleSheet.create({
  page: {
    padding: 34,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: '#1E1A17',
    backgroundColor: '#FFFFFF',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#C85A32',
    paddingBottom: 10,
    marginBottom: 12,
  },
  name: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  roleTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#C85A32',
    marginTop: 2,
  },
  contactRow: {
    fontSize: 8.5,
    color: '#4B5563',
    marginTop: 4,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#181C2E',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 3,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 9.2,
    lineHeight: 1.4,
    color: '#374151',
  },
  itemBlock: {
    marginBottom: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 9.8,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemMeta: {
    fontSize: 8.5,
    color: '#6B7280',
  },
  itemSub: {
    fontSize: 8.8,
    color: '#0F766E',
    marginBottom: 2,
  },
  bullet: {
    fontSize: 8.9,
    lineHeight: 1.35,
    color: '#374151',
    marginLeft: 8,
    marginBottom: 1.5,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillLabel: {
    width: 96,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#181C2E',
  },
  skillItems: {
    flex: 1,
    fontSize: 9,
    color: '#374151',
  },
})

export function ResumePdfDocument({ data }: { data: ResumeDocumentData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.roleTitle}>{data.roleTitle}</Text>
          <Text style={styles.contactRow}>
            {data.location} | {data.email} | {data.phone} | {data.github} | {data.website}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary ({data.personaLabel})</Text>
          <Text style={styles.bodyText}>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Stack</Text>
          {data.skillsGroups.map((grp) => (
            <View key={grp.label} style={styles.skillRow}>
              <Text style={styles.skillLabel}>{grp.label}:</Text>
              <Text style={styles.skillItems}>{grp.items.join(' • ')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience & Research</Text>
          {data.experience.map((exp) => (
            <View key={exp.role} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{exp.role}</Text>
                <Text style={styles.itemMeta}>{exp.period}</Text>
              </View>
              <Text style={styles.itemSub}>{exp.company}</Text>
              {exp.bullets.map((b) => (
                <Text key={b} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Flagship Builds & Acquisitions</Text>
          {data.projects.map((proj) => (
            <View key={proj.name} style={styles.itemBlock}>
              <Text style={styles.itemTitle}>{proj.name}</Text>
              <Text style={styles.itemSub}>{proj.stack}</Text>
              {proj.bullets.map((b) => (
                <Text key={b} style={styles.bullet}>
                  • {b}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.degree} style={styles.itemBlock}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>
                  {edu.degree} — {edu.school}
                </Text>
                <Text style={styles.itemMeta}>{edu.period}</Text>
              </View>
              <Text style={styles.bodyText}>{edu.details}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
