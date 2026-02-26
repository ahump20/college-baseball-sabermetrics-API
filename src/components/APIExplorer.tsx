import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { SectionCard } from '@/components/SectionCard';
import { CodeBlock } from '@/components/CodeBlock';
import { StatusPill } from '@/components/StatusPill';
import { CoveragePill } from '@/components/CoveragePill';
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
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3 w-full pr-4">
            <Badge className={`${methodColors[endpoint.method]} font-mono text-xs px-2.5 py-1 border font-semibold`}>
              {endpoint.method}
            </Badge>
            <code className="font-mono text-sm flex-1 text-left text-foreground">{endpoint.path}</code>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6 pt-2 pb-4 pl-1">
            <div>
              <p className="text-sm text-foreground leading-relaxed">{endpoint.description}</p>
            </div>

            {endpoint.params && endpoint.params.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Query Parameters</h4>
                <DataTable
                  columns={[
                    { key: 'name', label: 'Parameter', mono: true },
                    { key: 'type', label: 'Type', mono: true },
                    { key: 'required', label: 'Required', align: 'center' },
                    { key: 'description', label: 'Description' },
                  ]}
                  data={paramsTableData}
                  maxHeight="300px"
                  stickyHeader={false}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <StatusPill status="official" />
              <CoveragePill coverage="pbp" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Example Request</h4>
              <CodeBlock code={curlExample} language="bash" title="cURL" />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Example Response</h4>
              <CodeBlock 
                code={JSON.stringify(endpoint.response, null, 2)} 
                language="json" 
                title="200 OK" 
              />
            </div>

            <ProvenanceSnippet
              sources={['host_xml', 'licensed_feed_a']}
              lastUpdated="2026-03-04T18:22:10Z"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-semibold tracking-tight">API Explorer</h2>
        <p className="text-muted-foreground text-base max-w-4xl leading-relaxed">
          Browse the complete API surface with authentication patterns, request parameters, and
          response structures demonstrating NCAA policy compliance and provenance tracking.
        </p>
      </div>

      <div className="space-y-6">
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
