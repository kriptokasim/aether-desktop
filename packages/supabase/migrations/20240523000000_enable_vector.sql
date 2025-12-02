-- Enable Vector Extension
create extension if not exists vector;

-- Create Documents Table for Code Embeddings
create table if not exists documents (
  id bigserial primary key,
  content text, -- The actual code snippet
  metadata jsonb, -- File path, line numbers, function name
  embedding vector(1536) -- OpenAI Embedding dimension
);

-- Search Function
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
