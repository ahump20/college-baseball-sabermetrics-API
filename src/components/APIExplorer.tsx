import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { CodeBlock } from '@/components/CodeBlock';
import { StatusPill } from '@/components/StatusPill';
import { CoveragePill } from '@/components/CoveragePill';
import { ValidationBadge } from '@/components/ValidationBadge';
import { ProvenanceSnippet } from '@/components/ProvenanceSnippet';
import { DataTable } from '@/components/DataTable';
import { apiEndpoints } from '@/lib/data';
import type { APIEndpoint } from '@/lib/types';

const methodColors = {
  GET: 'bg-success/10 text-success border-success/20',
  POST: 'bg-primary/10 text-primary border-primary/20',
  PUT: 'bg-warning/10 text-warning border-warning/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function APIExplorer() {
  const categories = Array.from(new Set(apiEndpoints.map((e) => e.category)));

  const renderEndpoint = (endpoint: APIEndpoint) => {
    const curlExample = `curl -H "Authorization: Bearer <API_KEY>" \\
  "https://api.baseball-analytics.dev${endpoint.path}"`;

    const paramsTableData = endpoint.params?.map((p) => ({
      name: p.name,
      type: p.type,
      required: p.required ? 'Yes' : 'No',
      description: p.description,
    })) || [];

    return (
      <AccordionItem key={endpoint.path} value={endpoint.path}>
        <AccordionTrigger className="hover:no-underline py-5 group">
          <div className="flex items-center gap-3 w-full pr-4">
            <Badge variant="outline" className={`${methodColors[endpoint.method]} font-mono text-xs px-3 py-1.5 border font-semibold shrink-0`}>
              {endpoint.method}
            </Badge>
            <code className="font-mono text-[0.875rem] flex-1 text-left text-foreground group-hover:text-primary transition-colors">
              {endpoint.path}
            </code>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-8 pt-4 pb-6 pl-2 pr-1">
            <div>
              <p className="text-[0.875rem] text-foreground leading-[1.6]">{endpoint.description}</p>
            </div>

            {endpoint.params && endpoint.params.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[1.125rem] font-medium text-foreground">Query Parameters</h4>
                <DataTable
                  columns={[
                    { key: 'name', label: 'Parameter', mono: true, width: '180px' },
                    { key: 'type', label: 'Type', mono: true, width: '120px' },
                    { key: 'required', label: 'Required', align: 'center', width: '100px' },
                    { key: 'description', label: 'Description' },
                  ]}
                  data={paramsTableData}
                  maxHeight="300px"
                  stickyHeader={false}
                />
              </div>
            )}

            <div>
              <h4 className="text-[0.8125rem] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Trust Surfaces
              </h4>
              <div className="flex flex-wrap gap-2">
                <StatusPill status="official" />
                <CoveragePill coverage="pbp" />
                <ValidationBadge validation="proofed" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[1.125rem] font-medium text-foreground">Example Request</h4>
              <CodeBlock code={curlExample} language="bash" title="cURL" />
            </div>

            <div className="space-y-4">
              <h4 className="text-[1.125rem] font-medium text-foreground">Example Response</h4>
              <CodeBlock 
                code={JSON.stringify(endpoint.response, null, 2)} 
                language="json" 
                title="200 OK" 
              />
            </div>

            <div>
              <h4 className="text-[0.8125rem] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Data Provenance
              </h4>
              <ProvenanceSnippet
                sources={['host_xml', 'licensed_feed_a']}
                lastUpdated="2026-03-04T18:22:10Z"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="API Explorer"
        description="Browse the complete API surface with authentication patterns, request parameters, and response structures demonstrating NCAA policy compliance and provenance tracking."
      />

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryEndpoints = apiEndpoints.filter((e) => e.category === category);
          return (
            <SectionCard
              key={category}
              title={`${category} Endpoints`}
              description={`${categoryEndpoints.length} endpoint${categoryEndpoints.length !== 1 ? 's' : ''} for ${category.toLowerCase()} operations`}
            >
              <Accordion type="single" collapsible className="w-full">
                {categoryEndpoints.map(renderEndpoint)}
              </Accordion>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
