import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center gap-8 py-24">
      <Eyebrow>Error 404</Eyebrow>
      <h1 className="max-w-4xl headline text-display-xl">
        Out of bounds. <em>This level isn&apos;t built yet.</em>
      </h1>
      <p className="max-w-md text-[17px] text-fg-muted">The link may have fallen through the floor.</p>
      <div>
        <ButtonLink href="/" variant="secondary" trailingIcon={<ArrowRight />}>
          Back to spawn
        </ButtonLink>
      </div>
    </Container>
  );
}
