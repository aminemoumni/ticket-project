<?php

namespace App\Command;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:create-admin',
    description: 'Creates an admin user',
)]
class CreateAdminCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepository $userRepository,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Admin email')
            ->addArgument('password', InputArgument::REQUIRED, 'Admin password')
            ->addArgument('firstName', InputArgument::REQUIRED, 'First name')
            ->addArgument('lastName', InputArgument::REQUIRED, 'Last name');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');

        if ($this->userRepository->findOneBy(['email' => $email])) {
            $io->error("User with email {$email} already exists.");
            return Command::FAILURE;
        }

        $user = new User();
        $user->setEmail($email);
        $user->setFirstName($input->getArgument('firstName'));
        $user->setLastName($input->getArgument('lastName'));
        $user->setRoles(['ROLE_ADMIN']);
        $user->setPassword(
            $this->passwordHasher->hashPassword($user, $input->getArgument('password'))
        );

        $this->em->persist($user);
        $this->em->flush();

        $io->success("Admin user {$email} created successfully.");

        return Command::SUCCESS;
    }
}
