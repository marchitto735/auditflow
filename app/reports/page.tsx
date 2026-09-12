import Footer from "@/components/footer/footer";

export default function ReportsPage() {
  return (
    <>
      <main className="min-h-screen min-w-0 pb-0 md:pb-4">
        <section className="w-full px-4 md:px-8 lg:px-16 pt-0 pb-6 md:pb-9">
          <div className="max-w-[1328px] mx-auto flex min-h-12 items-center px-0 pl-14 lg:px-16">
            <h2 className="text-h2 heading-weight-medium text-foreground m-0">
              Reports
            </h2>
            <p className="text-body1 text-foreground mt-4 max-w-[576px]">
              Completed SOP audit reports will appear here.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
